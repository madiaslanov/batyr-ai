// ui/batyr.tsx
import style from "./batyr.module.css";
import { useState } from "react"; // Импортируем хуки

interface BatyrProps {
    tgUser?: {
        first_name: string;
        username?: string;
        photo_url?: string;
    };
    isRecording: boolean;
    isProcessing: boolean;
    isHistoryEmpty: boolean; // ✅ Новая пропса для онбординга
    onToggleRecording: () => void;
}

export const Batyr = ({
                          tgUser,
                          isRecording,
                          isProcessing,
                          isHistoryEmpty, // Получаем новую пропсу
                          onToggleRecording,
                      }: BatyrProps) => {
    // Состояние для отслеживания, был ли уже сделан первый клик
    const [isFirstClickDone, setIsFirstClickDone] = useState(false);

    // Обработчик клика, который также скроет онбординг
    const handleToggleRecording = () => {
        if (!isFirstClickDone) {
            setIsFirstClickDone(true);
        }
        onToggleRecording();
    };

    // Показываем онбординг, если история пуста и еще не было клика
    const showOnboarding = isHistoryEmpty && !isFirstClickDone;

    return (
        <div className={style.batyrContent}>
            <div className={style.holder}>
                <div className={style.description}>
                    <img src={tgUser?.photo_url || "/homePage/profile.png"} alt="Профиль" />
                    <p>{tgUser?.username || tgUser?.first_name || "Гость"}</p>
                </div>
            </div>

            {/* ✅ Блок с онбордингом */}
            {showOnboarding && (
                <div className={style.onboardingTooltip}>
                    <p>Сәлем! Менімен сөйлесу үшін осы жерді басыңыз</p>
                    <span>👇</span>
                </div>
            )}

            <div className={style.batyrModel} onClick={handleToggleRecording}>
                {/* ✅ Пульсирующий индикатор для привлечения внимания */}
                {showOnboarding && <div className={style.pulseIndicator}></div>}

                <div className={`${style.statusIndicator} ${isRecording ? style.recording : ''} ${isProcessing ? style.processing : ''}`}>
                    {isProcessing ? '🤔' : (isRecording ? '⏹️' : '🎤')}
                </div>

                <img
                    src="/homePage/Hero.png"
                    alt="Герой"
                />
            </div>
        </div>
    );
};