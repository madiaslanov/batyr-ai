import { useRef, useCallback, useState, useEffect } from 'react'; // Добавили useState и useEffect
import { Batyr } from "./ui/batyr";
import { useSpeech } from "../../service/reactHooks/useSpeech.ts";

declare global {
    interface Window { Telegram: { WebApp: any; }; }
}

const API_BASE_URL = "https://api.batyrai.com";
const PACKAGES = [
    { id: "1_gen", name: "1 генерация", price: "100 тг" },
    { id: "5_gen", name: "5 генераций", price: "450 тг" },
    { id: "10_gen", name: "10 генераций", price: "800 тг" },
];

export const BatyrContainer = () => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    // --- НОВАЯ ЛОГИКА И СОСТОЯНИЯ ---
    const [credits, setCredits] = useState<number | null>(null);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);

    // Функция для получения баланса с бэкенда
    const fetchUserStatus = useCallback(async () => {
        if (!window.Telegram?.WebApp?.initData) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/status`, {
                headers: { 'X-Telegram-Init-Data': window.Telegram.WebApp.initData },
            });
            if (!response.ok) throw new Error("Не удалось получить баланс");
            const data = await response.json();
            setCredits(data.credits);
        } catch (error) {
            console.error("Ошибка при получении статуса пользователя:", error);
            window.Telegram.WebApp.showAlert("Не удалось загрузить ваш баланс.");
        }
    }, []);

    // Загружаем баланс пользователя при первом рендере
    useEffect(() => {
        fetchUserStatus();
    }, [fetchUserStatus]);

    // Функция для обработки покупки
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
                throw new Error(errorData.detail || 'Ошибка создания счета');
            }
            const data = await response.json();
            window.Telegram.WebApp.openInvoice(data.invoice_link, (status: string) => {
                if (status === 'paid') {
                    window.Telegram.WebApp.showAlert("Оплата прошла успешно! Ваш баланс обновлен.");
                    setPaymentModalOpen(false);
                    fetchUserStatus(); // Обновляем баланс после успешной оплаты
                } else {
                    window.Telegram.WebApp.showAlert("Оплата не удалась или была отменена.");
                }
            });
        } catch (error: any) {
            window.Telegram.WebApp.showAlert(`Ошибка: ${error.message}`);
        } finally {
            setIsLoadingPayment(false);
        }
    };
    // --- КОНЕЦ НОВОЙ ЛОГИКИ ---

    const handleNewAnswer = useCallback((audioUrl: string) => {
        if (audioPlayerRef.current) audioPlayerRef.current.pause();
        const newAudio = new Audio(audioUrl);
        audioPlayerRef.current = newAudio;
        newAudio.play().catch(e => console.error("Ошибка воспроизведения аудио:", e));
        newAudio.onended = () => URL.revokeObjectURL(audioUrl);
    }, []);

    const handleError = useCallback((message: string) => {
        alert(message);
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

    // --- НОВАЯ ФУНКЦИЯ-ПРОВЕРКА ---
    // Эта функция будет вызываться при клике на батыра.
    // Она проверяет баланс перед тем, как запустить запись голоса.
    const handleToggleRecordingWithCheck = () => {
        if (credits !== null && credits > 0) {
            toggleRecording(); // Если кредиты есть - запускаем запись
            setCredits(prev => (prev !== null ? prev - 1 : 0)); // Оптимистичное обновление UI
        } else {
            // Если кредитов нет - показываем окно оплаты
            window.Telegram.WebApp.showAlert("У вас закончились кредиты. Пожалуйста, пополните баланс.");
            setPaymentModalOpen(true);
        }
    };

    return (
        <Batyr
            tgUser={tgUser}
            isRecording={isRecording}
            isProcessing={isProcessing}
            isHistoryEmpty={history.length === 0}
            // Передаем новую функцию-проверку вместо старой
            onToggleRecording={handleToggleRecordingWithCheck}
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