
import { useRef } from "react";
import {useBatyrState} from "./module/batyr.ts";
import { postTTS } from "./api";
import {Batyr} from "./ui/batyr.tsx";


export const BatyrContainer = () => {
    const { page, next, prev, totalPages } = useBatyrState();
    const touchStartX = useRef(0);
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    const onVoice = async () => {
        // @ts-ignore
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = "kk-KZ";
        recognition.onresult = async (e: any) => {
            const text = e.results[0][0].transcript;
            const audio = await postTTS(text);
            audio.play();
        };
        recognition.start();
    };

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (delta > 50 && page < totalPages) next();
        if (delta < -50 && page > 1) prev();
    };

    return (
        <Batyr onVoice={onVoice} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}  tgUser={tgUser} />
    );
};
