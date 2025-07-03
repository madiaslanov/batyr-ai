// PhotoContainer.tsx
import { useEffect, useRef } from "react";
import { useBatyrStore } from "./module/useBatyrStore.ts";
import { getTaskStatus, startFaceSwapTask } from "./api";
import Photo from "./ui/photo.tsx";

const POLLING_TIMEOUT_SECONDS = 180;

const PhotoContainer = () => {
    const {
        step, setStep,
        userPhoto, setUserPhoto,
        preview, setPreview,
        loading, setLoading,
        resultUrl, setResultUrl,
        jobId, setJobId,
        clearAll,
        isPolling, setIsPolling,
    } = useBatyrStore();

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollingStartTimeRef = useRef<number | null>(null);

    const clearLocalStorage = () => {
        localStorage.removeItem("batyr_job_id");
        localStorage.removeItem("batyr_result_url");
        localStorage.removeItem("batyr_preview");
    };

    const startPolling = (currentJobId: string) => {
        if (isPolling || intervalRef.current) return;

        console.log(`🚀 Начинаем опрос для Job ID: ${currentJobId}`);
        setIsPolling(true);
        pollingStartTimeRef.current = Date.now();

        intervalRef.current = setInterval(async () => {
            if (Date.now() - (pollingStartTimeRef.current ?? 0) > POLLING_TIMEOUT_SECONDS * 1000) {
                console.error("⏱️ Таймаут опроса истек.");
                alert("Время ожидания результата истекло. Пожалуйста, попробуйте еще раз.");
                handleClear();
                return;
            }

            try {
                const data = await getTaskStatus(currentJobId);
                console.log(`⌛ Статус задачи [${currentJobId}]: ${data.status}`);

                if (data.status === "completed") {
                    console.log("✅ Результат получен!", data.result_url);
                    stopPolling();
                    setResultUrl(data.result_url);
                    setLoading(false);
                    localStorage.setItem("batyr_result_url", data.result_url);
                    if (preview) {
                        localStorage.setItem("batyr_preview", preview);
                    }
                    localStorage.removeItem("batyr_job_id");
                    return;
                }

                if (data.status === "failed") {
                    console.error("❌ Задача завершилась с ошибкой:", data.error);
                    alert(`Ошибка генерации: ${data.error || "Неизвестная ошибка на сервере"}`);
                    handleClear();
                    return;
                }

            } catch (err) {
                console.error("🔥 Ошибка при опросе статуса:", err);
                alert("Произошла ошибка соединения при проверке статуса. Попробуйте обновить страницу.");
                handleClear();
            }
        }, 5000);
    };

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPolling(false);
        pollingStartTimeRef.current = null;
        console.log("🛑 Опрос остановлен.");
    };

    // ------------------ INIT (При загрузке страницы) ------------------
    // ✅ ИЗМЕНЕНО: Вся логика инициализации теперь обернута проверкой Telegram Web App
    useEffect(() => {
        // @ts-ignore
        const tg = window.Telegram?.WebApp;

        if (!tg) {
            console.error("Окружение Telegram Web App не найдено! Запуск в обычном браузере.");
            // Можно оставить возможность работать в браузере без данных телеграм для отладки,
            // но на реальном устройстве `tg` должен быть всегда.
            // alert("Ошибка: приложение должно быть запущено внутри Telegram.");
            return;
        }

        // Говорим Telegram, что наше приложение готово к отображению и взаимодействию.
        // Это важный шаг для стабильной работы на всех платформах.
        tg.ready();

        // Также можно настроить кнопку "Назад", если нужно
        // tg.BackButton.show();
        // tg.onEvent('backButtonClicked', handleClear);

        console.log("✅ Telegram Web App готово. Запускаем инициализацию состояния.");

        const storedJobId = localStorage.getItem("batyr_job_id");
        const storedResultUrl = localStorage.getItem("batyr_result_url");
        const storedPreview = localStorage.getItem("batyr_preview");

        if (storedResultUrl && storedPreview) {
            console.log("Восстановление из localStorage: найден готовый результат.");
            setPreview(storedPreview);
            setResultUrl(storedResultUrl);
            setStep(2);
            setLoading(false);
            return;
        }

        if (storedJobId) {
            console.log("Восстановление из localStorage: найдена активная задача.");
            setJobId(storedJobId);
            setPreview(storedPreview || null);
            setStep(2);
            setLoading(true);
            startPolling(storedJobId);
            return;
        }

        console.log("Новая сессия, состояние чистое.");
        handleClear();

        return () => {
            stopPolling();
            // if (tg) {
            //     tg.offEvent('backButtonClicked', handleClear);
            // }
        };
    }, []); // Пустой массив зависимостей = запуск только один раз при монтировании

    // ------------------ GENERATE (Запуск новой генерации) ------------------
    const handleNext = async () => {
        if (!userPhoto || loading) return;

        setStep(2);
        setLoading(true);
        setResultUrl(null);
        clearLocalStorage();

        try {
            console.log("🚀 Запускаем задачу на бэкенде...");
            const data = await startFaceSwapTask(userPhoto);
            const newJobId = data.job_id;

            if (newJobId) {
                setJobId(newJobId);
                localStorage.setItem("batyr_job_id", newJobId);
                if (preview) {
                    localStorage.setItem("batyr_preview", preview);
                }
                startPolling(newJobId);
            } else {
                console.error("❌ Не удалось запустить задачу: бэкенд не вернул job_id.");
                alert("Ошибка запуска генерации. Пожалуйста, попробуйте снова.");
                handleClear();
            }
        } catch (err) {
            console.error("🔥 Критическая ошибка при запуске задачи:", err);
            // Здесь теперь будет корректно отображаться ошибка из `api.ts`
            const errorMessage = (err as Error)?.message || "Произошла неизвестная ошибка.";
            alert(`Не удалось отправить фото: ${errorMessage}`);
            handleClear();
        }
    };

    const handleClear = () => {
        stopPolling();
        clearLocalStorage();
        clearAll();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleClear();
            const previewUrl = URL.createObjectURL(file);
            setUserPhoto(file);
            setPreview(previewUrl);
        }
    };

    const downloadImage = () => {
        if (!resultUrl) return;
        const link = document.createElement("a");
        link.href = resultUrl;
        link.download = "batyr-result.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Photo
            step={step}
            preview={preview}
            loading={loading}
            resultUrl={resultUrl}
            userPhoto={userPhoto}
            onNext={handleNext}
            onClear={handleClear}
            onFileChange={handleFileChange}
            onDownload={downloadImage}
        />
    );
};

export default PhotoContainer;