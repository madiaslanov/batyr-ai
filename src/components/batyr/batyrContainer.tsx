import { useEffect, useRef, useState } from "react";
import { useBatyrState } from "./module/batyr.ts";
import { postTTS } from "./api";
import { Batyr } from "./ui/batyr.tsx";

export const BatyrContainer = () => {
    const { page, next, prev, totalPages } = useBatyrState();
    const touchStartX = useRef(0);
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    const [showHint, setShowHint] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Показать текстовую подсказку при первом входе
    useEffect(() => {
        setShowHint(true);
        const timer = setTimeout(() => {
            setShowHint(false);
        }, 8000);
        return () => clearTimeout(timer);
    }, []);

    const onVoice = async () => {
        // @ts-ignore
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = "kk-KZ";
        recognition.interimResults = false;

        let hasSpoken = false;

        recognition.onstart = () => {
            setIsListening(true);
            setShowHint(false);
        };

        recognition.onresult = async (e: any) => {
            hasSpoken = true;
            setIsListening(false);
            const text = e.results[0][0].transcript;
            const audio = await postTTS(text);
            audio.play();
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            if (!hasSpoken) {
                setTimeout(() => {
                    if (!hasSpoken) {
                        setShowHint(true);
                    }
                }, 5000);
            }
        };

        recognition.start();
    };

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        setShowHint(false);
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (delta > 50 && page < totalPages) next();
        if (delta < -50 && page > 1) prev();
    };

    return (
        <Batyr
            onVoice={onVoice}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            tgUser={tgUser}
            showHint={showHint}
            isListening={isListening}
        />
    );
};
