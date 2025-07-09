

import { useRef, useCallback } from 'react'; // <-- 1. Импортируем useRef и useCallback
import { Batyr } from "./ui/batyr";
import { useSpeech } from "../../service/reactHooks/useSpeech.ts";

export const BatyrContainer = () => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    const handleNewAnswer = useCallback((audioUrl: string) => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
        }

        const newAudio = new Audio(audioUrl);

        audioPlayerRef.current = newAudio;

        audioPlayerRef.current.play().catch(e => console.error("Ошибка воспроизведения аудио:", e));


        newAudio.onended = () => {
            URL.revokeObjectURL(audioUrl);
        };
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