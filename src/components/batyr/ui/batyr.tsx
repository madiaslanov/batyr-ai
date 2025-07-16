import style from "./batyr.module.css";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../../../features/languageSelector/LanguageSelector.tsx";
import {ThemeSelector} from "../../../features/ThemeSelector/ThemeSelector.tsx";


// --- Интерфейсы оставляем без изменений ---
interface Package {
    id: string;
    price: string;
    count: number;
}

interface BatyrProps {
    tgUser?: { first_name: string; username?: string; photo_url?: string; };
    isRecording: boolean;
    isProcessing: boolean;
    isHistoryEmpty: boolean;
    onToggleRecording: () => void;
    credits: number | null;
    isPaymentModalOpen: boolean;
    isLoadingPayment: boolean;
    onOpenPaymentModal: () => void;
    onClosePaymentModal: () => void;
    onPurchase: (packageId: string) => void;
    packages: Package[];
}

export const Batyr = ({
                          tgUser, isRecording, isProcessing, isHistoryEmpty, onToggleRecording,
                          credits, isPaymentModalOpen, isLoadingPayment, onOpenPaymentModal,
                          onClosePaymentModal, onPurchase, packages,
                      }: BatyrProps) => {
    // Хук для перевода текста остается без изменений
    const { t } = useTranslation();
    const [showHint, setShowHint] = useState(false);

    // ✅ 2. Добавляем новое состояние для хранения выбранной темы. По умолчанию - 'kz'
    const [selectedTheme, setSelectedTheme] = useState('kz');

    // ✅ 3. Генерируем пути к картинкам на основе состояния `selectedTheme`, а НЕ языка
    const batyrImagePath = `/homePage/${selectedTheme}-batyr.png`;
    const backgroundImagePath = `/homePage/${selectedTheme}-background.png`;

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

    const getGenerationsText = (count: number) => {
        return t('generations', { count });
    };

    return (
        <div
            className={style.batyrContent}
            // Фон по-прежнему устанавливаем динамически, но теперь он зависит от `selectedTheme`
            style={{ backgroundImage: `url(${backgroundImagePath})` }}
        >
            {/* ✅ 4. В .topBar теперь два компонента: для выбора языка и для выбора темы */}
            <div className={style.topBar}>
                <LanguageSelector />
            </div>
            <div className={style.topLeft}>
                <ThemeSelector
                    selectedTheme={selectedTheme}
                    onSelectTheme={setSelectedTheme}
                />
            </div>

            {/* --- Весь остальной код компонента остается БЕЗ ИЗМЕНЕНИЙ --- */}

            {isPaymentModalOpen && (
                <div className={style.modalOverlay} onClick={onClosePaymentModal}>
                    <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>{t('topUpBalance')}</h3>
                        <p>{t('creditsNeeded')}</p>
                        <div className={style.packageList}>
                            {packages.map((pkg) => (
                                <button
                                    key={pkg.id}
                                    className={style.packageItem}
                                    onClick={() => onPurchase(pkg.id)}
                                    disabled={isLoadingPayment}
                                >
                                    <span className={style.packageName}>{getGenerationsText(pkg.count)}</span>
                                    <span className={style.packagePrice}>{pkg.price}</span>
                                </button>
                            ))}
                        </div>
                        {isLoadingPayment && <div className={style.loader}></div>}
                    </div>
                </div>
            )}
            <div className={style.holder}>
                <div className={style.description}>
                    <img src={tgUser?.photo_url || "/homePage/profile.png"} alt="Profile" />
                    <p>{tgUser?.username || tgUser?.first_name || "Guest"}</p>
                    <div className={style.creditsHolder} onClick={onOpenPaymentModal}>
                        <span>{t('balance')}:</span>
                        <div className={style.creditsAmount}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffc107" className={style.creditsIcon}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM11 17h2v-1h-2v1zm2-2.25V16h-2v-1.25c-1.35-.5-2-1.77-2-3.25 0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 1.48-.65 2.75-2 3.25z"/><path d="M0 0h24v24H0z" fill="none"/><path d="M12.5 10.5h-1v2.53c.69.15 1.2.72 1.2 1.47 0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5c0-.75.51-1.32 1.2-1.47V10.5h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h3c.28 0 .5.22.5.5s-.22.5-.5.5z" opacity=".3"/></svg>
                            <span>{credits === null ? "..." : credits}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={style.batyrWrapper}>
                {showHint && (
                    <div className={style.welcomeHint}>
                        {t('batyrHintLine1')} <br/>
                        {t('batyrHintLine2')} <br />
                        <strong>{t('exampleQuestion')}</strong>
                    </div>
                )}
                <div className={style.batyrModel} onClick={handleToggleRecording}>
                    <div className={`${style.statusIndicator} ${isRecording ? style.recording : ''} ${isProcessing ? style.processing : ''}`}>
                        {isProcessing ? '🤔' : (isRecording ? '⏹️' : '🎤')}
                    </div>
                    {/* ✅ 5. Используем путь к модели, который теперь зависит от `selectedTheme` */}
                    <img src={batyrImagePath} alt="Selected character" />
                </div>
            </div>
        </div>
    );
};