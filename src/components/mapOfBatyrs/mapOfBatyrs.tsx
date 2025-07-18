// src/components/mapOfBatyrs/MapOfBatyrs.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from "react-i18next";
import style from './MapOfBatyrs.module.css';

// 1. УБИРАЕМ ИМПОРТ ГЛОБАЛЬНОГО ХРАНИЛИЩА
// import { useThemeStore } from '../../store/themeStore';
import kzMapData from '../../data/kz.ts'; // Убедитесь, что пути правильные
import ruMapData from '../../data/ru.ts';
import enMapData from '../../data/en.ts';


// Глобальные объявления и интерфейсы
declare global {
    interface Window {
        handleMapClick?: (regionId: string) => void;
        simplemaps_countrymap?: any;
        simplemaps_countrymap_mapdata?: any;
    }
}
interface Batyr { name: string; years: string; description: string; image: string | null; }
interface HistoricalEvent { name: string; period: string; description: string; }
interface RegionData { region_name: string; main_text: string; batyrs: Batyr[]; historical_events: HistoricalEvent[]; }

// 2. ДОБАВЛЯЕМ ИНТЕРФЕЙС ДЛЯ PROPS
interface MapOfBatyrsProps {
    theme: 'kz' | 'ru' | 'en';
}

// 3. КОМПОНЕНТ ТЕПЕРЬ ПРИНИМАЕТ PROPS
const MapOfBatyrs = ({ theme }: MapOfBatyrsProps) => {
    // 4. УБИРАЕМ ВЫЗОВ useThemeStore, ИСПОЛЬЗУЕМ THEME ИЗ PROPS
    const { t, i18n } = useTranslation();
    const API_URL = 'https://api.batyrai.com'; // Используйте ваш URL

    // Состояния компонента
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [regionData, setRegionData] = useState<RegionData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const textToReadRef = useRef<string>('');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);

    // Функции-обработчики (без изменений)
    const handleStopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            const audioUrl = audioRef.current.src;
            if (audioUrl && audioUrl.startsWith('blob:')) {
                URL.revokeObjectURL(audioUrl);
            }
            audioRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    const handleRegionClick = useCallback((regionId: string) => {
        setSelectedRegionId(regionId);
    }, []);

    const handlePlayAudio = async () => {
        if (!textToReadRef.current || isAudioLoading || isSpeaking) return;
        handleStopAudio();
        setIsAudioLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept-Language': i18n.language },
                body: JSON.stringify({ text: textToReadRef.current }),
            });
            if (!response.ok) throw new Error(t('ttsError'));
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.onplay = () => setIsSpeaking(true);
            audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(audioUrl); };
            audio.onerror = () => { setIsSpeaking(false); setError(t('audioPlayError')); URL.revokeObjectURL(audioUrl); };
            await audio.play();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsAudioLoading(false);
        }
    };

    // useEffect для загрузки данных региона (логика не меняется, но зависимость от theme теперь корректна)
    useEffect(() => {
        if (!selectedRegionId) { setRegionData(null); return; }
        const fetchRegionData = async () => {
            handleStopAudio();
            setRegionData(null);
            setError(null);
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/region/${selectedRegionId}?theme=${theme}`, {
                    headers: { 'Accept-Language': i18n.language }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ description: t('mapError') }));
                    throw new Error(errorData.description || t('mapError'));
                }
                const data: RegionData = await response.json();
                setRegionData(data);
                const heroesText = data.batyrs.map(b => `${b.name}. ${b.description}`).join(' ');
                const eventsText = data.historical_events.map(e => `${e.name}. ${e.description}`).join(' ');
                textToReadRef.current = `${data.region_name}. ${data.main_text} ${t('mapReadBatyrs')}: ${heroesText}. ${t('mapReadEvents')}: ${eventsText}`;
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchRegionData();
    }, [selectedRegionId, i18n.language, theme, handleStopAudio, t, API_URL]);


    // useEffect для смены ТЕМЫ карты (без изменений)
    useEffect(() => {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        let isMounted = true;
        const cleanupPreviousMap = () => {
            if (mapContainer) mapContainer.innerHTML = '';
            document.querySelectorAll('script[data-map-engine="true"]').forEach(s => s.remove());
            window.simplemaps_countrymap = undefined;
            window.simplemaps_countrymap_mapdata = undefined;
            window.handleMapClick = undefined;
        };

        const loadEngineScript = (src: string): Promise<void> => new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.setAttribute('data-map-engine', 'true');
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load engine script: ${src}`));
            document.head.appendChild(script);
        });

        const initializeMap = async () => {
            cleanupPreviousMap();
            if (isMounted) {
                setSelectedRegionId(null);
                setRegionData(null);
                setError(null);
            }

            let mapDataObject;
            let mapEngineFile;

            if (theme === 'ru') {
                mapDataObject = ruMapData;
                mapEngineFile = '/ru-countrymap.js';
            } else if (theme === 'en') {
                mapDataObject = enMapData;
                mapEngineFile = '/en-countrymap.js';
            } else { // 'kz' по умолчанию
                mapDataObject = kzMapData;
                mapEngineFile = '/kz-countrymap.js';
            }

            try {
                window.simplemaps_countrymap_mapdata = mapDataObject;
                await loadEngineScript(mapEngineFile);
                if (isMounted) {
                    window.handleMapClick = handleRegionClick;
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setError(t('mapLoadError'));
            }
        };

        initializeMap();
        return () => { isMounted = false; handleStopAudio(); cleanupPreviousMap(); };
    }, [theme, handleRegionClick, t]);

    // useEffect для обновления ЯЗЫКА на карте (без изменений)
    useEffect(() => {
        if (!window.simplemaps_countrymap?.load || !window.simplemaps_countrymap_mapdata?.state_specific) {
            return;
        }
        const data = window.simplemaps_countrymap_mapdata;
        for (const stateId in data.state_specific) {
            const state = data.state_specific[stateId];
            if (!state.original_name) state.original_name = state.name;

            if (i18n.language === 'kz' && state.name_kz) state.name = state.name_kz;
            else if (i18n.language === 'ru' && state.name_ru) state.name = state.name_ru;
            else if (i18n.language === 'en' && state.name_en) state.name = state.name_en;
            else state.name = state.original_name;
        }
        window.simplemaps_countrymap.load();
    }, [i18n.language, theme]);


    // JSX разметка (без изменений)
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