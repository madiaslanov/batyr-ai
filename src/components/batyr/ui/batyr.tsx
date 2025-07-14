// Полное содержимое для файла Batyr.tsx

import style from "./batyr.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Интерфейс для пакетов
interface Package {
    id: string;
    name: string;
    price: string;
}

// Обновляем пропсы компонента
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
    // Новые пропсы для платежей
    credits: number | null;
    isPaymentModalOpen: boolean;
    isLoadingPayment: boolean;
    onOpenPaymentModal: () => void;
    onClosePaymentModal: () => void;
    onPurchase: (packageId: string) => void;
    packages: Package[];
}

export const Batyr = ({
                          tgUser,
                          isRecording,
                          isProcessing,
                          isHistoryEmpty,
                          onToggleRecording,
                          // Получаем новые пропсы
                          credits,
                          isPaymentModalOpen,
                          isLoadingPayment,
                          onOpenPaymentModal, // <-- Получаем эту функцию
                          onClosePaymentModal,
                          onPurchase,
                          packages,
                      }: BatyrProps) => {
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
        onToggleRecording(); // Вызываем функцию-проверку из контейнера
    };

    return (
        <div className={style.batyrContent}>
            {/* Модальное окно для оплаты */}
            {isPaymentModalOpen && (
                <div className={style.modalOverlay} onClick={onClosePaymentModal}>
                    <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>Пополнить баланс</h3>
                        <p>Выберите подходящий пакет:</p>
                        <div className={style.packageList}>
                            {packages.map((pkg) => (
                                <button
                                    key={pkg.id}
                                    className={style.packageItem}
                                    onClick={() => onPurchase(pkg.id)}
                                    disabled={isLoadingPayment}
                                >
                                    <span className={style.packageName}>{pkg.name}</span>
                                    <span className={style.packagePrice}>{pkg.price}</span>
                                </button>
                            ))}
                        </div>
                        {isLoadingPayment && <div className={style.loader}></div>}
                    </div>
                </div>
            )}

            {/* Блок с профилем и балансом */}
            <div className={style.holder}>
                <div className={style.description}>
                    <img src={tgUser?.photo_url || "/homePage/profile.png"} alt="Профиль" />
                    <p>{tgUser?.username || tgUser?.first_name || "Гость"}</p>

                    {/* --- ИСПРАВЛЕННЫЙ БЛОК --- */}
                    {/* Мы добавили onClick, который вызывает функцию onOpenPaymentModal из пропсов */}
                    <div className={style.creditsHolder} onClick={onOpenPaymentModal}>
                        <span>Баланс:</span>
                        <div className={style.creditsAmount}>
                            {/* SVG иконка монетки */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffc107" className={style.creditsIcon}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM11 17h2v-1h-2v1zm2-2.25V16h-2v-1.25c-1.35-.5-2-1.77-2-3.25 0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 1.48-.65 2.75-2 3.25z"/><path d="M0 0h24v24H0z" fill="none"/><path d="M12.5 10.5h-1v2.53c.69.15 1.2.72 1.2 1.47 0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5c0-.75.51-1.32 1.2-1.47V10.5h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h3c.28 0 .5.22.5.5s-.22.5-.5.5z" opacity=".3"/></svg>
                            <span>{credits === null ? "..." : credits}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Блок с батыром */}
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
        </div>
    );
};