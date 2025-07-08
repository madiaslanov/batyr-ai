// ui/batyr.tsx

import style from "./batyr.module.css";
import { useState, useEffect } from "react";
// ✅ Импортируем useNavigate для навигации
import { useNavigate } from "react-router-dom";

interface BatyrProps {
    tgUser?: {
        first_name: string;
        username?: string;
        photo_url?: string;
    };
    isRecording: boolean;
    isProcessing: boolean;
    isHistoryEmpty: boolean;
    onToggleRecording: () => void;
}

export const Batyr = ({
                          tgUser,
                          isRecording,
                          isProcessing,
                          isHistoryEmpty,
                          onToggleRecording,
                      }: BatyrProps) => {

    // ✅ Получаем функцию навигации
    const navigate = useNavigate();

    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        if (isHistoryEmpty) {
            setShowHint(true);
            const timer = setTimeout(() => setShowHint(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [isHistoryEmpty]);

    const handleToggleRecording = () => {
        setShowHint(false);
        onToggleRecording();
    };

    return (
        <div className={style.batyrContent}>
            <div className={style.holder}>
                <div className={style.description}>
                    <img src={tgUser?.photo_url || "/homePage/profile.png"} alt="Профиль" />
                    <p>{tgUser?.username || tgUser?.first_name || "Гость"}</p>
                </div>
            </div>

            <div className={style.batyrWrapper}>
                {showHint && (
                    <div className={style.welcomeHint}>
                        Батырды баста, <br/>
                        Маған сұрақ қой, мысалы: <br />
                        <strong>«Алтын Орда қашан құрылды?»</strong>
                    </div>
                )}
                <div className={style.batyrModel} onClick={handleToggleRecording}>
                    <div className={`${style.statusIndicator} ${isRecording ? style.recording : ''} ${isProcessing ? style.processing : ''}`}>
                        {isProcessing ? '🤔' : (isRecording ? '⏹️' : '🎤')}
                    </div>
                    <img
                        src="/homePage/batyr.png"
                        alt="Герой"
                    />
                </div>
            </div>

            {/* ✅ НОВАЯ КНОПКА ДЛЯ ПЕРЕХОДА К ШЕЖИРЕ */}
            {/*<div className={style.shezhireButton} onClick={() => navigate('/shezhire')}>*/}
            {/*    📜 Шежіре*/}
            {/*</div>*/}
        </div>
    );
};