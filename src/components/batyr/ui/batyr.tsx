import style from "./batyr.module.css";
import React from "react";

interface BatyrProps {
    onVoice: () => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    tgUser?: {
        first_name: string;
        last_name?: string;
        username?: string;
        photo_url?: string;
    };
    showHint?: boolean;
    isListening?: boolean;
}

export const Batyr = ({ onVoice, onTouchStart, onTouchEnd, tgUser, showHint, isListening }: BatyrProps) => {
    return (
        <div
            className={style.batyrContent}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <div className={style.holder}>
                <div className={style.description}>
                    <img
                        src={tgUser?.photo_url || "/homePage/profile.png"}
                        alt="Профиль"
                    />
                    <p>{tgUser?.username || tgUser?.first_name || "Гость"}</p>
                </div>
            </div>

            <div className={style.batyrModel}>
                <img
                    src="/homePage/Hero.png"
                    alt="Герой"
                    onClick={onVoice}
                    style={{ cursor: "pointer" }}
                />
            </div>

            {showHint && (
                <div className={style.hintBubble}>
                    🗣 Сұраңыз: “Абай кім?” немесе “1991 жылы не болды?”
                </div>
            )}

            {isListening && (
                <div className={style.listeningIndicator}>
                    <span className={style.dot} />
                    <span>Тыңдап жатыр...</span>
                </div>
            )}
        </div>
    );
};
