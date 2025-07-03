// ui/batyr.tsx
import style from "./batyr.module.css";
import { useState, useEffect } from "react"; // Импортируем хуки

interface BatyrProps {
    tgUser?: {
        first_name: string;
        username?: string;
        photo_url?: string;
    };
    isRecording: boolean;
    isProcessing: boolean;
    isHistoryEmpty: boolean; // Эта пропса нам все еще нужна
    onToggleRecording: () => void;
}

export const Batyr = ({
                          tgUser,
                          isRecording,
                          isProcessing,
                          isHistoryEmpty,
                          onToggleRecording,
                      }: BatyrProps) => {

    // Состояние для отображения приветственной подсказки
    const [showHint, setShowHint] = useState(false);

    // Эффект, который покажет подсказку, если история пуста
    useEffect(() => {
        if (isHistoryEmpty) {
            // Показываем подсказку при монтировании компонента
            setShowHint(true);

            // Устанавливаем таймер, чтобы скрыть подсказку через 5 секунд
            const timer = setTimeout(() => {
                setShowHint(false);
            }, 5000); // 5000 миллисекунд = 5 секунд

            // Очищаем таймер, если компонент размонтируется раньше
            return () => clearTimeout(timer);
        }
    }, [isHistoryEmpty]); // Зависимость от isHistoryEmpty

    // Обработчик клика, который принудительно скроет подсказку и начнет запись
    const handleToggleRecording = () => {
        setShowHint(false); // Скрываем подсказку при первом же действии
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

            {/* Модель Батыра теперь обертка для подсказки */}
            <div className={style.batyrWrapper}>
                {/* ✅ Новая приветственная подсказка */}
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
        </div>
    );
};