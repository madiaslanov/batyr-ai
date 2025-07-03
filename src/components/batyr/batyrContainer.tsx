// BatyrContainer.tsx

import { Batyr } from "./ui/batyr";
import { useSpeech } from "../../service/reactHooks/useSpeech"; // Убедитесь, что путь верный

export const BatyrContainer = () => {
    // Данные о пользователе из Telegram Web App
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    // Коллбэк для воспроизведения аудио ответа
    const handleNewAnswer = (audioUrl: string) => {
        const audio = new Audio(audioUrl);
        audio.play().catch(e => console.error("Ошибка воспроизведения аудио:", e));
    };

    const handleError = (message: string) => {
        // Здесь можно показать красивое уведомление вместо alert
        alert(message);
    };

    // ✅ Получаем из хука не только флаги, но и саму историю
    const {
        isRecording,
        isProcessing,
        history, // <--- 1. Получаем историю
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
            isHistoryEmpty={history.length === 0} // <--- 2. Передаем флаг пустоты истории
            onToggleRecording={toggleRecording}
        />
    );
};