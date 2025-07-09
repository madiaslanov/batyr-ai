
import { useState, useEffect, useCallback, useRef } from 'react';
import style from './MapOfBatyrs.module.css';
import { useMapSpeech } from "../../service/reactHooks/useMapSpeech.ts";

declare global {
    interface Window {
        handleMapClick?: (regionId: string) => void;
        simplemaps_countrymap?: {
            load: () => void;
        };
        simplemaps_countrymap_mapdata?: any;
    }
}

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
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);

    const handleStopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            audioRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    const handleRegionClick = useCallback(async (regionId: string) => {
        console.log(`✅ Клик из mapdata.js! ▶️ Запрос для региона: ${regionId}`);
        handleStopAudio();
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


    useEffect(() => {
        window.handleMapClick = handleRegionClick;

        const loadScript = (src: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                document.head.appendChild(script);
            });
        };

        const initializeMap = async () => {
            try {
                await loadScript('/mapdata.js');
                await loadScript('/countrymap.js');

                if (window.simplemaps_countrymap?.load) {
                    window.simplemaps_countrymap.load();
                    console.log("🗺️ Карта успешно переинициализирована!");
                } else {
                    console.warn("Функция simplemaps_countrymap.load() не найдена. Карта может не отобразиться.");
                }
            } catch (err) {
                console.error("Ошибка при инициализации карты:", err);
                setError("Картаны жүктеу мүмкін болмады.");
            }
        };

        if (!document.getElementById('simplemaps-css-script')) {
            const cssLink = document.createElement('link');
            cssLink.id = 'simplemaps-css-script';
            cssLink.rel = 'stylesheet';
            cssLink.href = '/map.css';
            document.head.appendChild(cssLink);
        }

        initializeMap();

        return () => {
            window.handleMapClick = undefined;
            handleStopAudio();
        };
    }, [handleRegionClick, handleStopAudio]);

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
            audio.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
            };
            audio.onerror = () => {
                setIsSpeaking(false);
                setError("Аудиофайлды ойнату мүмкін болмады.");
                URL.revokeObjectURL(audioUrl);
            };
            audio.play();

        } catch (err) {
            setError("Өкінішке орай, аудионы жүктеу мүмкін болмады.");
        } finally {
            setIsAudioLoading(false);
        }
    };



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
        if (!nextState) {
            if (isRecording) {
                toggleRecording();
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

            <div id="map" className={`${style.mapContainer} swiper-no-swiping`}></div>


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
                                <button onClick={handleStopAudio} className={`${style.button} ${style.stopButton}`}>🔇
                                    Тоқтату</button>
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
                            <button onClick={clearHistory} className={style.clearButton}
                                    disabled={history.length === 0 || isProcessing}>Тазалау
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapOfBatyrs;