// Полностью замени содержимое файла: src/components/mapOfBatyrs/mapOfBatyrs.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from "react-i18next";
import style from './MapOfBatyrs.module.css';
import { useMapSpeech } from "../../service/reactHooks/useMapSpeech.ts";

declare global {
    interface Window {
        handleMapClick?: (regionId: string) => void;
        simplemaps_countrymap?: any;
    }
}

interface Batyr { name: string; years: string; description: string; image: string | null; }
interface HistoricalEvent { name: string; period: string; description: string; }
interface RegionData { region_name: string; main_text: string; batyrs: Batyr[]; historical_events: HistoricalEvent[]; }


const MapOfBatyrs = () => {
    const { t, i18n } = useTranslation();
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
        handleStopAudio();
        setRegionData(null);
        setError(null);
        setLoading(true);
        try {
            // FIX: Добавляем заголовок с языком
            const response = await fetch(`${API_URL}/api/region/${regionId}`, {
                headers: { 'Accept-Language': i18n.language }
            });
            if (!response.ok) {
                // FIX: Пытаемся получить осмысленную ошибку от сервера
                const errorData = await response.json().catch(() => ({ description: `Server error: ${response.status}` }));
                throw new Error(errorData.description || `Server responded with error: ${response.status}`);
            }
            const data: RegionData = await response.json();
            setRegionData(data);

            // FIX: Используем t() для формирования текста для озвучки
            const batyrsText = data.batyrs.map(b => `${b.name}. ${b.description}`).join(' ');
            const eventsText = data.historical_events.map(e => `${e.name}. ${e.description}`).join(' ');
            textToReadRef.current = `${data.region_name}. ${data.main_text} ${t('mapReadBatyrs')}: ${batyrsText}. ${t('mapReadEvents')}: ${eventsText}`;

        } catch (err) {
            console.error("Error loading region data:", err);
            // FIX: Отображаем ошибку с сервера или общую
            setError((err as Error).message || t('mapError'));
        } finally {
            setLoading(false);
        }
    }, [API_URL, handleStopAudio, t, i18n.language]);


    useEffect(() => {
        window.handleMapClick = handleRegionClick;
        if (window.simplemaps_countrymap_mapdata) {
            // Динамически меняем язык тултипов на карте
            for (const state in window.simplemaps_countrymap_mapdata.state_specific) {
                if (i18n.language === 'kz') {
                    window.simplemaps_countrymap_mapdata.state_specific[state].name = window.simplemaps_countrymap_mapdata.state_specific[state].name_kz || window.simplemaps_countrymap_mapdata.state_specific[state].name;
                } else if (i18n.language === 'en') {
                    window.simplemaps_countrymap_mapdata.state_specific[state].name = window.simplemaps_countrymap_mapdata.state_specific[state].name_en || window.simplemaps_countrymap_mapdata.state_specific[state].name;
                } else {
                    window.simplemaps_countrymap_mapdata.state_specific[state].name = window.simplemaps_countrymap_mapdata.state_specific[state].name_ru || window.simplemaps_countrymap_mapdata.state_specific[state].name;
                }
            }
            if (window.simplemaps_countrymap?.load) {
                window.simplemaps_countrymap.load();
            }
        }
    }, [handleRegionClick, i18n.language]);

    useEffect(() => {
        const loadScript = (src: string): Promise<void> => new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
            const script = document.createElement('script');
            script.src = src; script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });

        const initializeMap = async () => {
            try {
                await loadScript('/mapdata.js'); await loadScript('/countrymap.js');
                if (window.simplemaps_countrymap?.load) window.simplemaps_countrymap.load();
            } catch (err) { setError("Failed to load map."); }
        };
        if (!document.getElementById('simplemaps-css-script')) {
            const cssLink = document.createElement('link');
            cssLink.id = 'simplemaps-css-script'; cssLink.rel = 'stylesheet'; cssLink.href = '/map.css';
            document.head.appendChild(cssLink);
        }
        initializeMap();
        return () => { window.handleMapClick = undefined; handleStopAudio(); };
    }, [handleStopAudio]);

    const handlePlayAudio = async () => {
        if (!textToReadRef.current || isAudioLoading) return;
        handleStopAudio(); setIsAudioLoading(true); setIsSpeaking(false); setError(null);
        try {
            const response = await fetch(`${API_URL}/api/tts`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToReadRef.current }),
            });
            if (!response.ok) throw new Error('Server could not generate audio.');
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.onplay = () => setIsSpeaking(true);
            audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(audioUrl); };
            audio.onerror = () => { setIsSpeaking(false); setError("Could not play audio file."); URL.revokeObjectURL(audioUrl); };
            audio.play();
        } catch (err) { setError("Could not load audio.");
        } finally { setIsAudioLoading(false); }
    };

    const [isAssistantVisible, setIsAssistantVisible] = useState(false);
    const assistantAudioRef = useRef<HTMLAudioElement | null>(null);

    const handleAssistantAnswer = useCallback((audioUrl: string) => {
        if (assistantAudioRef.current) assistantAudioRef.current.pause();
        const audio = new Audio(audioUrl);
        assistantAudioRef.current = audio;
        audio.play().catch(e => console.error("Assistant audio playback error:", e));
    }, []);

    const { isRecording, isProcessing, history, toggleRecording, clearHistory } = useMapSpeech({
        onNewAnswer: handleAssistantAnswer,
        onError: (message) => alert(`Assistant error: ${message}`),
        apiUrl: API_URL
    });

    const toggleAssistant = () => {
        const nextState = !isAssistantVisible;
        setIsAssistantVisible(nextState);
        if (!nextState) { if (isRecording) toggleRecording(); if (assistantAudioRef.current) assistantAudioRef.current.pause(); }
    };

    return (
        <div className={style.pageContainer}>
            <div className={style.header}>
                <h1>{t('mapTitle')}</h1>
                <p>{t('mapSubtitle')}</p>
            </div>
            <div id="map" className={`${style.mapContainer} swiper-no-swiping`}></div>
            <div className={style.infoPanel}>
                {loading && <div className={style.loader}>{t('mapLoading')}</div>}
                {error && <div className={style.error}>{error}</div>}
                {!loading && !error && !regionData && (
                    <div className={style.placeholder}>{t('mapPlaceholder')}</div>
                )}
                {regionData && (
                    <div className={style.infoContent}>
                        <h2>{regionData.region_name}</h2>
                        <p className={style.mainText}>{regionData.main_text}</p>
                        <div className={style.buttons}>
                            {isAudioLoading ? (
                                <button className={style.button} disabled>⏳ {t('loading')}</button>
                            ) : !isSpeaking ? (
                                <button onClick={handlePlayAudio} className={style.button}>{t('read')}</button>
                            ) : (
                                <button onClick={handleStopAudio} className={`${style.button} ${style.stopButton}`}>{t('stop')}</button>
                            )}
                        </div>
                        <h3>{t('regionBatyrs')}</h3>
                        <div className={style.listContainer}>
                            {regionData.batyrs.map((batyr, index) => (
                                <div key={`${batyr.name}-${index}`} className={style.batyrCard}>
                                    <img src={batyr.image || '/batyr-placeholder.png'} alt={`Portrait of ${batyr.name}`} className={style.batyrImage} />
                                    <div className={style.cardContent}>
                                        <strong>{batyr.name} ({batyr.years})</strong>
                                        <p>{batyr.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <h3>{t('regionEvents')}</h3>
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
            <button className={style.assistantFAB} onClick={toggleAssistant}>?</button>

            {isAssistantVisible && (
                <div className={style.assistantOverlay} onClick={toggleAssistant}>
                    <div className={style.assistantModal} onClick={(e) => e.stopPropagation()}>
                        <div className={style.assistantHeader}>
                            <h3>{t('assistantTitle')}</h3>
                            <button onClick={toggleAssistant} className={style.closeButton}>×</button>
                        </div>
                        <div className={style.chatContainer}>
                            {history.length === 0 && !isProcessing && (
                                <div className={style.chatPlaceholder}>{t('assistantPlaceholder')}</div>
                            )}
                            {history.map((msg, index) => (
                                <div key={index} className={msg.role === 'user' ? style.userMsg : style.assistantMsg}>{msg.content}</div>
                            ))}
                            {isProcessing && <div className={style.assistantMsg}>{t('thinking')}</div>}
                        </div>
                        <div className={style.assistantFooter}>
                            <button onClick={toggleRecording} className={`${style.micButton} ${isRecording ? style.micRecording : ''}`} disabled={isProcessing}>
                                {isProcessing ? '⏳' : isRecording ? '■' : '●'}
                            </button>
                            <button onClick={clearHistory} className={style.clearButton} disabled={history.length === 0 || isProcessing}>{t('clearHistory')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapOfBatyrs;