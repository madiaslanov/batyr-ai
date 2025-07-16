// Полностью замени содержимое файла: src/components/batyr/batyrContainer.tsx

import { useRef, useCallback, useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Batyr } from "./ui/batyr";
import { useSpeech } from "../../service/reactHooks/useSpeech.ts";

declare global { interface Window { Telegram: any; } }

const API_BASE_URL = "https://api.batyrai.com";

export const BatyrContainer = () => {
    const { t } = useTranslation();
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    const [credits, setCredits] = useState<number | null>(null);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);

    // Пакеты теперь формируются на основе текущего языка
    const PACKAGES = [
        { id: "5_gen", count: 5, price: "500 тг" },
        { id: "10_gen", count: 10, price: "800 тг" },
    ];

    const fetchUserStatus = useCallback(async () => {
        if (!window.Telegram?.WebApp?.initData) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/status`, {
                headers: { 'X-Telegram-Init-Data': window.Telegram.WebApp.initData },
            });
            if (!response.ok) throw new Error("Failed to get balance");
            const data = await response.json();
            setCredits(data.credits);
        } catch (error) {
            console.error("Error fetching user status:", error);
            if (credits !== null) {
                window.Telegram.WebApp.showAlert("Failed to load your balance.");
            }
        }
    }, [credits]);

    useEffect(() => {
        fetchUserStatus();
    }, [fetchUserStatus]);

    const handlePurchase = async (packageId: string) => {
        setIsLoadingPayment(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/create-invoice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Telegram-Init-Data': window.Telegram.WebApp.initData,
                },
                body: JSON.stringify({ package_id: packageId }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create invoice');
            }
            const data = await response.json();
            window.Telegram.WebApp.openInvoice(data.invoice_link, (status: string) => {
                if (status === 'paid') {
                    window.Telegram.WebApp.showPopup({
                        title: 'Success!',
                        message: 'Payment was successful! Your balance has been updated.',
                        buttons: [{ type: 'ok' }]
                    });
                    setPaymentModalOpen(false);
                    fetchUserStatus();
                } else if (status !== 'cancelled') {
                    window.Telegram.WebApp.showAlert("Payment failed.");
                }
            });
        } catch (error: any) {
            window.Telegram.WebApp.showAlert(`Error: ${error.message}`);
        } finally {
            setIsLoadingPayment(false);
        }
    };

    const handleNewAnswer = useCallback((audioUrl: string) => {
        if (audioPlayerRef.current) audioPlayerRef.current.pause();
        const newAudio = new Audio(audioUrl);
        audioPlayerRef.current = newAudio;
        newAudio.play().catch(e => console.error("Audio playback error:", e));
        newAudio.onended = () => URL.revokeObjectURL(audioUrl);
    }, []);

    const handleError = useCallback((message: string) => {
        window.Telegram.WebApp.showAlert(message);
    }, []);

    const {
        isRecording,
        isProcessing,
        history,
        toggleRecording,
    } = useSpeech({
        onNewAnswer: handleNewAnswer,
        onError: handleError,
    });

    return (
        <Batyr
            tgUser={tgUser}
            isRecording={isRecording}
            isProcessing={isProcessing}
            isHistoryEmpty={history.length === 0}
            onToggleRecording={toggleRecording}
            credits={credits}
            isPaymentModalOpen={isPaymentModalOpen}
            isLoadingPayment={isLoadingPayment}
            onOpenPaymentModal={() => setPaymentModalOpen(true)}
            onClosePaymentModal={() => setPaymentModalOpen(false)}
            onPurchase={handlePurchase}
            packages={PACKAGES}
        />
    );
};