import { useState, useEffect, useCallback, useRef } from 'react';
import style from './MapOfBatyrs.module.css';
import {useMapSpeech} from "../../service/reactHooks/useMapSpeech.ts";

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

    // --- Состояние и логика для Карты ---
    const [regionData, setRegionData] = useState<RegionData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const textToReadRef = useRef<string>('');
    const mapInitialized = useRef(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);

    // Функция остановки озвучки для карты
    const handleStopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            URL.revokeObjectURL(audioRef.current.src);
            audioRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    // Функция получения данных при клике на регион
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
    }, [API_URL, handleStopAudio]);

    // Эффект для инициализации карты
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

    // Функция для озвучки текста с карты
    const handlePlayAudio = async () => {
        if (!textToReadRef.current || isAudioLoading) return;

        handleStopAudio();
        setIsAudioLoading(true);
        setIsSpeaking(false);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToReadRef.current }),
            });

            if (!response.ok) {
                throw new Error('Сервер не смог сгенерировать аудио.');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onplay = () => setIsSpeaking(true);
            audio.onended = () => setIsSpeaking(false);
            audio.onerror = () => {
                setIsSpeaking(false);
                setError("Аудиофайлды ойнату мүмкін болмады.");
            };
            audio.play();

        } catch (err) {
            setError("Өкінішке орай, аудионы жүктеу мүмкін болмады.");
        } finally {
            setIsAudioLoading(false);
        }
    };


    // --- Состояние и логика для Голосового Ассистента ---
    const [isAssistantVisible, setIsAssistantVisible] = useState(false);
    const assistantAudioRef = useRef<HTMLAudioElement | null>(null);

    const handleAssistantAnswer = useCallback((audioUrl: string) => {
        if (assistantAudioRef.current) {
            assistantAudioRef.current.pause();
        }
        const audio = new Audio(audioUrl);
        assistantAudioRef.current = audio;
        audio.play().catch(e => console.error("Ошибка воспроизведения аудио ассистента:", e));
    }, []);

    const { isRecording, isProcessing, history, toggleRecording, clearHistory } = useMapSpeech({
        onNewAnswer: handleAssistantAnswer,
        onError: (message) => alert(`Ассистент қатесі: ${message}`),
        apiUrl: API_URL
    });

    const toggleAssistant = () => {
        const nextState = !isAssistantVisible;
        setIsAssistantVisible(nextState);
        // Если закрываем окно, останавливаем все процессы ассистента
        if (!nextState) {
            if (isRecording) {
                toggleRecording(); // это вызовет stopRecording в хуке
            }
            if (assistantAudioRef.current) {
                assistantAudioRef.current.pause();
            }
        }
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

            {/* Кнопка вызова ассистента */}
            <button onClick={toggleAssistant} className={style.assistantFab} aria-label="Ассистентті шақыру">
                🎙️
            </button>

            {/* Модальное окно ассистента */}
            {isAssistantVisible && (
                <div className={style.assistantOverlay} onClick={toggleAssistant}>
                    <div className={style.assistantModal} onClick={(e) => e.stopPropagation()}>
                        <div className={style.assistantHeader}>
                            <h3>AI-Көмекші Батыр</h3>
                            <button onClick={toggleAssistant} className={style.closeButton}>×</button>
                        </div>
                        <div className={style.chatContainer}>
                            {history.length === 0 && !isProcessing && (
                                <div className={style.chatPlaceholder}>Тарих туралы сұрағыңызды қойыңыз...</div>
                            )}
                            {history.map((msg, index) => (
                                <div key={index} className={msg.role === 'user' ? style.userMsg : style.assistantMsg}>
                                    {msg.content}
                                </div>
                            ))}
                            {isProcessing && <div className={style.assistantMsg}>Ойланып жатырмын...</div>}
                        </div>
                        <div className={style.assistantFooter}>
                            <button
                                onClick={toggleRecording}
                                className={`${style.micButton} ${isRecording ? style.micRecording : ''}`}
                                disabled={isProcessing}
                            >
                                {isProcessing ? '⏳' : isRecording ? '■' : '●'}
                            </button>
                            <button onClick={clearHistory} className={style.clearButton} disabled={history.length === 0 || isProcessing}>Тазалау</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapOfBatyrs;