import { useState, useEffect, useCallback, useRef } from 'react';
import style from './mapOfBatyrs.module.css';

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
    // asl
    const [regionData, setRegionData] = useState<RegionData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const textToReadRef = useRef<string>('');
    const mapInitialized = useRef(false);

    // Эта функция будет вызываться напрямую из mapdata.js через глобальный объект window
    const handleRegionClick = useCallback(async (regionId: string) => {
        console.log(`✅ Клик из mapdata.js! ▶️ Запрос для региона: ${regionId}`);

        setRegionData(null);
        setError(null);
        setLoading(true);
        speechSynthesis.cancel();
        setIsSpeaking(false);
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
    }, [API_URL]);

    // Упрощенный useEffect, использующий глобальную функцию
    useEffect(() => {
        // "Выставляем" нашу React-функцию в глобальный доступ, чтобы mapdata.js мог ее вызвать
        window.handleMapClick = handleRegionClick;

        if (mapInitialized.current) return;
        mapInitialized.current = true;

        // Вспомогательная функция, чтобы не дублировать код
        const loadScript = (id: string, src: string, onLoad?: () => void) => {
            if (document.getElementById(id)) {
                // Если скрипт уже есть, просто вызываем callback
                if (onLoad) onLoad();
                return;
            };
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

        // Просто загружаем скрипты в правильном порядке.
        // Никаких 'hooks' и 'setInterval' больше не нужно.
        loadScript('simplemaps-mapdata-script', '/mapdata.js', () => {
            console.log("✔️ Скрипт с данными (mapdata.js) загружен.");
            loadScript('simplemaps-countrymap-script', '/countrymap.js', () => {
                console.log("✔️ Скрипт карты (countrymap.js) загружен. Карта готова к работе.");
            });
        });

        // Функция очистки: удаляем глобальную функцию, когда компонент исчезает
        return () => {
            window.handleMapClick = undefined;
        };
    }, [handleRegionClick]);

    const handlePlayAudio = () => {
        if (!textToReadRef.current || !('speechSynthesis' in window)) return;
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToReadRef.current);
        const voices = speechSynthesis.getVoices();
        utterance.voice = voices.find(voice => voice.lang === 'kk-KZ') || voices.find(voice => voice.lang === 'ru-RU') || voices[0];
        utterance.lang = utterance.voice?.lang || 'ru-RU';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
    };

    const handleStopAudio = () => {
        speechSynthesis.cancel();
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
                            {!isSpeaking ? (
                                <button onClick={handlePlayAudio} className={style.button}>🔊 Оқу</button>
                            ) : (
                                <button onClick={handleStopAudio} className={`${style.button} ${style.stopButton}`}>🔇 Тоқтату</button>
                            )}
                        </div>
                        <h3>Осы өңірдің батырлары</h3>
                        <div className={style.listContainer}>
                            {/* ✅↓↓↓ ГЛАВНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ ↓↓↓✅ */}
                            {regionData.batyrs.map((batyr, index) => (
                                <div key={`${batyr.name}-${index}`} className={style.batyrCard}>
                                    <img
                                        src={batyr.image || '/batyr-placeholder.png'} // Используем фото батыра или заглушку
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