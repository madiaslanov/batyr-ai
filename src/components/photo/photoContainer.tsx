// PhotoContainer.tsx
import { useEffect, useRef, useState } from "react";
import { useBatyrStore } from "./module/useBatyrStore.ts";
// ✅ Импортируем новую функцию и удаляем старую
import { getTaskStatus, startFaceSwapTask, sendPhotoToChat } from "./api";
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
        loadingMessage, setLoadingMessage,
    } = useBatyrStore();

    // ✅ Переименовано для ясности
    const [isSending, setIsSending] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollingStartTimeRef = useRef<number | null>(null);

    const clearLocalStorage = () => {
        localStorage.removeItem("batyr_job_id");
        localStorage.removeItem("batyr_result_url");
        localStorage.removeItem("batyr_preview");
    };

    const startPolling = (currentJobId: string) => {
        if (isPolling || intervalRef.current) return;
        setLoadingMessage('⏳ Уменьшаю ваше фото и подбираю образ...');
        setIsPolling(true);
        pollingStartTimeRef.current = Date.now();
        intervalRef.current = setInterval(async () => {
            if (Date.now() - (pollingStartTimeRef.current ?? 0) > POLLING_TIMEOUT_SECONDS * 1000) {
                alert("Время ожидания результата истекло. Пожалуйста, попробуйте еще раз.");
                handleClear();
                return;
            }
            try {
                const data = await getTaskStatus(currentJobId);
                if (data.message) { setLoadingMessage(data.message); }
                if (data.status === "completed") {
                    stopPolling();
                    setResultUrl(data.result_url);
                    setLoading(false);
                    localStorage.setItem("batyr_result_url", data.result_url);
                    if (preview) { localStorage.setItem("batyr_preview", preview); }
                    localStorage.removeItem("batyr_job_id");
                    return;
                }
                if (data.status === "failed") {
                    alert(`Ошибка: ${data.error || "Неизвестная ошибка на сервере"}`);
                    handleClear();
                    return;
                }
            } catch (err) {
                alert("Произошла ошибка соединения при проверке статуса. Попробуйте обновить страницу.");
                handleClear();
            }
        }, 5000);
    };

    const stopPolling = () => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        setIsPolling(false);
        pollingStartTimeRef.current = null;
    };

    useEffect(() => {
        // @ts-ignore
        const tg = window.Telegram?.WebApp;
        if (!tg) { return; }
        tg.ready();
        const storedJobId = localStorage.getItem("batyr_job_id");
        const storedResultUrl = localStorage.getItem("batyr_result_url");
        const storedPreview = localStorage.getItem("batyr_preview");
        if (storedResultUrl && storedPreview) {
            setPreview(storedPreview);
            setResultUrl(storedResultUrl);
            setStep(2);
            setLoading(false);
            setLoadingMessage("✅ Изображение готово");
            return;
        }
        if (storedJobId) {
            setJobId(storedJobId);
            setPreview(storedPreview || null);
            setStep(2);
            setLoading(true);
            startPolling(storedJobId);
            return;
        }
        handleClear();
        return () => stopPolling();
    }, []);

    const handleNext = async () => {
        if (!userPhoto || loading) return;
        setStep(2);
        setLoading(true);
        setResultUrl(null);
        clearLocalStorage();
        try {
            const data = await startFaceSwapTask(userPhoto);
            if (data.job_id) {
                setJobId(data.job_id);
                localStorage.setItem("batyr_job_id", data.job_id);
                if (preview) { localStorage.setItem("batyr_preview", preview); }
                startPolling(data.job_id);
            } else {
                alert("Ошибка запуска генерации. Пожалуйста, попробуйте снова.");
                handleClear();
            }
        } catch (err) {
            alert(`Не удалось отправить фото: ${(err as Error).message}`);
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

    // ✅ ИЗМЕНЕНО: Функция теперь отправляет фото в чат
    const handleSendToChat = async () => {
        if (!resultUrl || isSending) return;
        setIsSending(true);
        try {
            await sendPhotoToChat(resultUrl);
            alert("Готово! Фото отправлено в ваш чат с ботом. 🚀");
        } catch (error) {
            alert(`Не удалось отправить фото: ${(error as Error).message}`);
        } finally {
            setIsSending(false);
        }
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
            onSendToChat={handleSendToChat} // ✅ Передаем новый обработчик
            isSending={isSending} // ✅ Передаем новое состояние
            loadingMessage={loadingMessage}
        />
    );
};

export default PhotoContainer;