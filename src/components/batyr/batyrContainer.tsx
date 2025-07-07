// BatyrContainer.tsx (ИСПРАВЛЕННАЯ ВЕРСИЯ)

import { useRef, useCallback } from 'react'; // <-- 1. Импортируем useRef и useCallback
import { Batyr } from "./ui/batyr";
import { useSpeech } from "../../service/reactHooks/useSpeech.ts";

export const BatyrContainer = () => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    // ✅ 2. Создаем реф для хранения аудио плеера
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    // ✅ 3. Создаем новую, надежную функцию для воспроизведения
    const handleNewAnswer = useCallback((audioUrl: string) => {
        // Если предыдущее аудио еще играет, останавливаем его
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
        }

        // Создаем новый плеер
        const newAudio = new Audio(audioUrl);

        // Сохраняем его в реф, чтобы он не был удален сборщиком мусора
        audioPlayerRef.current = newAudio;

        // Запускаем воспроизведение
        audioPlayerRef.current.play().catch(e => console.error("Ошибка воспроизведения аудио:", e));

        // (Опционально, но рекомендуется) Очищаем URL, когда воспроизведение закончится
        newAudio.onended = () => {
            URL.revokeObjectURL(audioUrl);
        };
    }, []); // useCallback с пустым массивом зависимостей гарантирует, что функция не будет пересоздаваться

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

    return (
        <Batyr
            tgUser={tgUser}
            isRecording={isRecording}
            isProcessing={isProcessing}
            isHistoryEmpty={history.length === 0}
            onToggleRecording={toggleRecording}
        />
    );
};