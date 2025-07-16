// src/components/mapOfBatyrs/MapOfBatyrs.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from "react-i18next";
import style from './MapOfBatyrs.module.css';

// Объявления глобальных типов остаются без изменений
declare global {
    interface Window {
        handleMapClick?: (regionId: string) => void;
        simplemaps_countrymap?: any;
        simplemaps_countrymap_mapdata?: any;
    }
}

// Интерфейсы данных остаются без изменений
interface Batyr { name: string; years: string; description: string; image: string | null; }
interface HistoricalEvent { name: string; period: string; description: string; }
interface RegionData { region_name: string; main_text: string; batyrs: Batyr[]; historical_events: HistoricalEvent[]; }


const MapOfBatyrs = () => {
    const { t, i18n } = useTranslation();
    const API_URL = 'https://api.batyrai.com';

    // --- 1. НОВОЕ СОСТОЯНИЕ для хранения ID выбранного региона ---
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

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

    // --- 2. ИЗМЕНЕНА ЛОГИКА КЛИКА ---
    // Теперь эта функция только устанавливает ID. Загрузка данных вынесена в useEffect.
    const handleRegionClick = useCallback((regionId: string) => {
        setSelectedRegionId(regionId);
    }, []);


    // --- 3. НОВЫЙ useEffect ДЛЯ ЗАГРУЗКИ ДАННЫХ ---
    // Этот хук будет срабатывать КАЖДЫЙ РАЗ, когда меняется ID региона ИЛИ ЯЗЫК.
    useEffect(() => {
        // Если регион не выбран, ничего не делаем
        if (!selectedRegionId) {
            setRegionData(null); // Очищаем данные, если регион сброшен
            return;
        }

        const fetchRegionData = async () => {
            handleStopAudio();
            setRegionData(null);
            setError(null);
            setLoading(true);

            try {
                const response = await fetch(`${API_URL}/api/region/${selectedRegionId}`, {
                    headers: { 'Accept-Language': i18n.language }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ description: `Server error: ${response.status}` }));
                    throw new Error(errorData.description || `Server responded with error: ${response.status}`);
                }
                const data: RegionData = await response.json();
                setRegionData(data);

                const batyrsText = data.batyrs.map(b => `${b.name}. ${b.description}`).join(' ');
                const eventsText = data.historical_events.map(e => `${e.name}. ${e.description}`).join(' ');
                textToReadRef.current = `${data.region_name}. ${data.main_text} ${t('mapReadBatyrs')}: ${batyrsText}. ${t('mapReadEvents')}: ${eventsText}`;

            } catch (err) {
                console.error("Error loading region data:", err);
                setError((err as Error).message || t('mapError'));
            } finally {
                setLoading(false);
            }
        };

        fetchRegionData();
        // Зависимости: функция запускается при смене ID или языка
    }, [selectedRegionId, i18n.language, handleStopAudio, t, API_URL]);


    // Этот useEffect для обновления названий на карте остается без изменений, он работает правильно
    useEffect(() => {
        window.handleMapClick = handleRegionClick;
        if (window.simplemaps_countrymap_mapdata?.state_specific) {
            for (const stateId in window.simplemaps_countrymap_mapdata.state_specific) {
                const state = window.simplemaps_countrymap_mapdata.state_specific[stateId];
                if (i18n.language === 'kz') {
                    // Используем имя по умолчанию, которое должно быть 'kz'
                    state.name = window.simplemaps_countrymap_mapdata.state_specific[stateId].name_kz || window.simplemaps_countrymap_mapdata.state_specific[stateId].name;
                } else if (i18n.language === 'en') {
                    state.name = state.name_en || state.name;
                } else { // 'ru'
                    state.name = state.name_ru || state.name;
                }
            }
            if (window.simplemaps_countrymap?.load) {
                window.simplemaps_countrymap.load();
            }
        }
    }, [handleRegionClick, i18n.language]);

    // Этот useEffect для инициализации карты остается без изменений
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
                // После загрузки скриптов, нужно обновить язык карты, т.к. предыдущий useEffect мог сработать раньше
                if (window.simplemaps_countrymap?.load) {
                    i18n.changeLanguage(i18n.language); // "Пнем" язык еще раз, чтобы обновить карту
                }
            } catch (err) { setError("Failed to load map."); }
        };
        if (!document.getElementById('simplemaps-css-script')) {
            const cssLink = document.createElement('link');
            cssLink.id = 'simplemaps-css-script'; cssLink.rel = 'stylesheet'; cssLink.href = '/map.css';
            document.head.appendChild(cssLink);
        }
        initializeMap();
        return () => { window.handleMapClick = undefined; handleStopAudio(); };
    }, [handleStopAudio, i18n]); // Добавили i18n для стабильности


    // Остальной код компонента (TTS, ассистент, JSX-разметка) остается без изменений
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
        </div>
    );
};

export default MapOfBatyrs;