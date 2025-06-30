import style from "./batyr.module.css";
import { useRef, useState } from "react";

const Batyr = () => {
    const isSpeakingRef = useRef(false);
    const [currentPage, setCurrentPage] = useState(1);
    const touchStartX = useRef(0);
    const totalPages = 3;

    // 🎙 Голосовой ввод + TTS-ответ
    const handleVoiceInteraction = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Браузер не поддерживает распознавание речи");
            return;
        }

        const recognition = new window.webkitSpeechRecognition(); // @ts-ignore
        recognition.lang = "kk-KZ";
        recognition.interimResults = false;

        recognition.onresult = async (event: any) => {
            const userText = event.results[0][0].transcript;
            console.log("🎤 Вы сказали:", userText);

            try {
                const res = await fetch("http://localhost:8000/api/tts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ text: userText }),
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("❌ Ошибка сервера:", errorText);
                    return;
                }

                const audioBlob = await res.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);

                audio.onplaying = () => {
                    isSpeakingRef.current = true;
                };
                audio.onended = () => {
                    isSpeakingRef.current = false;
                };

                audio.play();
            } catch (error) {
                console.error("💥 Ошибка запроса:", error);
            }
        };

        recognition.onerror = (e) => {
            console.error("🎙 Ошибка распознавания:", e.error);
        };

        recognition.start();
    };

    // 👆 Свайп-логика
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        const delta = touchStartX.current - endX;

        // Блокируем свайп влево на последней странице
        if (delta > 50) {
            if (currentPage >= totalPages) {
                console.log("⛔ Нельзя свайпнуть дальше вправо (последняя страница)");
                return;
            }
            setCurrentPage((prev) => prev + 1);
        }

        // Блокируем свайп вправо на первой странице
        else if (delta < -50) {
            if (currentPage <= 1) {
                console.log("⛔ Нельзя свайпнуть дальше влево (первая страница)");
                return;
            }
            setCurrentPage((prev) => prev - 1);
        }
    };

    return (
        <div
            className={style.batyrContent}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className={style.holder}>
                <div className={style.description}>
                    <img src="/homePage/profile.png" alt="Профиль" />
                    <p>Madi</p>
                </div>
                <div className={style.settings}>
                    <img src="/homePage/settings.png" alt="Настройки" />
                </div>
            </div>

            <div className={style.batyrModel}>
                <img
                    src="/homePage/Hero.png"
                    alt="Герой"
                    onClick={handleVoiceInteraction}
                    style={{ cursor: "pointer" }}
                />
            </div>

        </div>
    );
};

export default Batyr;
