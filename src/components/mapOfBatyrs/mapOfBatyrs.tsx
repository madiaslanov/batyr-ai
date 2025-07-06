import { useState, useEffect, useCallback, useRef } from 'react';
import style from './MapOfBatyrs.module.css';

// Объявляем нашу будущую глобальную функцию, чтобы TypeScript ее "видел"
declare global {
    interface Window {
        handleMapClick?: (regionId: string) => void;
    }
}

// Интерфейсы для данных API
interface Batyr { name: string; years: string; description: string; image: string | null; }
interface HistoricalEvent { name: string; period: string; description: string; }
interface RegionData { region_name: string; main_text: string; batyrs: Batyr[]; historical_events: HistoricalEvent[]; }

const MapOfBatyrs = () => {
    const API_URL = 'https://api.batyrai.com';

    const [regionData, setRegionData] = useState<RegionData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const textToReadRef = useRef<string>('');
    const mapInitialized = useRef(false);

    // ✅ НОВЫЕ ПЕРЕМЕННЫЕ ДЛЯ УПРАВЛЕНИЯ АУДИО
    const audioRef = useRef<HTMLAudioElement | null>(null); // Ссылка на наш <audio> элемент
    const [isAudioLoading, setIsAudioLoading] = useState(false); // Состояние загрузки аудио

    // Функция для получения данных о регионе (без изменений)
    const handleRegionClick = useCallback(async (regionId: string) => {
        console.log(`✅ Клик из mapdata.js! ▶️ Запрос для региона: ${regionId}`);
        handleStopAudio(); // Останавливаем озвучку от предыдущего региона
        setRegionData(null);
        setError(null);
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/region/${regionId}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Сервер ответил ошибкой: ${response.status}. ${errorText}`);
            }
            const data: RegionData = await response.json();
            setRegionData(data);
            const batyrsText = data.batyrs.map(b => `${b.name}. ${b.description}`).join(' ');
            const eventsText = data.historical_events.map(e => `${e.name}. ${e.description}`).join(' ');
            textToReadRef.current = `${data.region_name}. ${data.main_text} Осы өңірдің батырлары: ${batyrsText}. Тарихи оқиғалар: ${eventsText}`;
        } catch (err) {
            console.error("Ошибка при загрузке данных о регионе:", err);
            setError("Өкінішке орай, деректерді жүктеу мүмкін болмады. Интернет байланысын немесе сервердің жұмысын тексеріңіз.");
        } finally {
            setLoading(false);
        }
    }, []); // API_URL константа, ее можно не включать в зависимости

    // useEffect для инициализации карты (без изменений)
    useEffect(() => {
        window.handleMapClick = handleRegionClick;

        if (mapInitialized.current) return;
        mapInitialized.current = true;

        const loadScript = (id: string, src: string, onLoad?: () => void) => {
            if (document.getElementById(id)) {
                if (onLoad) onLoad();
                return;
            }
            const script = document.createElement('script');
            script.id = id;
            script.src = src;
            if (onLoad) script.onload = onLoad;
            document.head.appendChild(script);
        };

        if (!document.getElementById('simplemaps-css-script')) {
            const cssLink = document.createElement('link');
            cssLink.id = 'simplemaps-css-script';
            cssLink.rel = 'stylesheet';
            cssLink.href = '/map.css';
            document.head.appendChild(cssLink);
        }

        loadScript('simplemaps-mapdata-script', '/mapdata.js', () => {
            console.log("✔️ Скрипт с данными (mapdata.js) загружен.");
            loadScript('simplemaps-countrymap-script', '/countrymap.js', () => {
                console.log("✔️ Скрипт карты (countrymap.js) загружен. Карта готова к работе.");
            });
        });

        return () => {
            window.handleMapClick = undefined;
        };
    }, [handleRegionClick]);

    // ✅ ОБНОВЛЕННАЯ ЛОГИКА ОЗВУЧКИ ЧЕРЕЗ БЭКЕНД
    const handlePlayAudio = async () => {
        if (!textToReadRef.current || isAudioLoading) return;

        handleStopAudio(); // Останавливаем предыдущее аудио, если оно есть
        setIsAudioLoading(true);
        setIsSpeaking(false);
        setError(null); // Сбрасываем старые ошибки

        try {
            const response = await fetch(`${API_URL}/api/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToReadRef.current }),
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                console.error("Сервер вернул ошибку при синтезе речи:", errorDetails);
                throw new Error('Сервер не смог сгенерировать аудио.');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Создаем и проигрываем аудио
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onplay = () => {
                console.log("▶️ Воспроизведение аудио началось");
                setIsSpeaking(true);
            }
            audio.onended = () => {
                console.log("⏹️ Воспроизведение аудио завершено");
                setIsSpeaking(false);
            };
            audio.onerror = (e) => {
                console.error("Ошибка воспроизведения аудио:", e);
                setIsSpeaking(false);
                setError("Аудиофайлды ойнату мүмкін болмады.");
            };

            audio.play();

        } catch (err) {
            console.error("Ошибка при получении аудио:", err);
            setError("Өкінішке орай, аудионы жүктеу мүмкін болмады.");
        } finally {
            setIsAudioLoading(false);
        }
    };

    const handleStopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            // Освобождаем ссылку, чтобы сборщик мусора мог удалить объект
            URL.revokeObjectURL(audioRef.current.src);
            audioRef.current = null;
        }
        setIsSpeaking(false);
    };

    return (
        <div className={style.pageContainer}>
            <div className={style.header}>
                <h1>🌍 Батырлар Картасы</h1>
                <p>Еліміздің тарихын біл! Аймақты басып, батырлар жайлы оқы.</p>
            </div>
            <div id="map" className={style.mapContainer}></div>
            <div className={style.infoPanel}>
                {loading && <div className={style.loader}>Ақсақалдардан сұрап жатырмыз...</div>}
                {error && <div className={style.error}>{error}</div>}
                {!loading && !error && !regionData && (
                    <div className={style.placeholder}>
                        Ақпарат алу үшін картадағы кез келген аймақты таңдаңыз.
                    </div>
                )}
                {regionData && (
                    <div className={style.infoContent}>
                        <h2>{regionData.region_name}</h2>
                        <p className={style.mainText}>{regionData.main_text}</p>
                        <div className={style.buttons}>
                            {/* ✅ ОБНОВЛЕННЫЙ БЛОК КНОПОК С СОСТОЯНИЕМ ЗАГРУЗКИ */}
                            {isAudioLoading ? (
                                <button className={style.button} disabled>⏳ Жүктелуде...</button>
                            ) : !isSpeaking ? (
                                <button onClick={handlePlayAudio} className={style.button}>🔊 Оқу</button>
                            ) : (
                                <button onClick={handleStopAudio} className={`${style.button} ${style.stopButton}`}>🔇 Тоқтату</button>
                            )}
                        </div>
                        <h3>Осы өңірдің батырлары</h3>
                        <div className={style.listContainer}>
                            {regionData.batyrs.map((batyr, index) => (
                                <div key={`${batyr.name}-${index}`} className={style.batyrCard}>
                                    <img
                                        src={batyr.image || '/batyr-placeholder.png'}
                                        alt={`Портрет ${batyr.name}`}
                                        className={style.batyrImage}
                                    />
                                    <div className={style.cardContent}>
                                        <strong>{batyr.name} ({batyr.years})</strong>
                                        <p>{batyr.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <h3>Маңызды тарихи оқиғалар</h3>
                        <div className={style.listContainer}>
                            {regionData.historical_events.map((event, index) => (
                                <div key={`${event.name}-${index}`} className={style.card}>
                                    <strong>{event.name} ({event.period})</strong>
                                    <p>{event.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapOfBatyrs;