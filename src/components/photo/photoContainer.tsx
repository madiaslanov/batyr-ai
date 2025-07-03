// PhotoContainer.tsx
import { useEffect, useRef, useState } from "react";
import { useBatyrStore } from "./module/useBatyrStore.ts";
import { getTaskStatus, startFaceSwapTask, downloadImageProxy } from "./api";
import Photo from "./ui/photo.tsx";

const POLLING_TIMEOUT_SECONDS = 100;

const PhotoContainer = () => {
    // ✅ 1. Достаем новое состояние и сеттер из хранилища
    const {
        step, setStep,
        userPhoto, setUserPhoto,
        preview, setPreview,
        loading, setLoading,
        resultUrl, setResultUrl,
        jobId, setJobId,
        clearAll,
        isPolling, setIsPolling,
        loadingMessage, setLoadingMessage, // <-- Новые переменные
    } = useBatyrStore();

    const [isDownloading, setIsDownloading] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollingStartTimeRef = useRef<number | null>(null);

    const clearLocalStorage = () => {
        localStorage.removeItem("batyr_job_id");
        localStorage.removeItem("batyr_result_url");
        localStorage.removeItem("batyr_preview");
    };

    const startPolling = (currentJobId: string) => {
        if (isPolling || intervalRef.current) return;

        // Устанавливаем начальное сообщение
        setLoadingMessage('⏳ Уменьшаю ваше фото и подбираю образ...');

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
                console.log(`⌛ Статус задачи [${currentJobId}]: ${data.status}, Сообщение: ${data.message}`);

                // ✅ 2. ГЛАВНОЕ ИЗМЕНЕНИЕ: Обновляем сообщение для пользователя
                if (data.message) {
                    setLoadingMessage(data.message);
                }

                if (data.status === "completed") {
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
                    alert(`Ошибка генерации: ${data.error || "Неизвестная ошибка на сервере"}`);
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
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
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
            const newJobId = data.job_id;
            if (newJobId) {
                setJobId(newJobId);
                localStorage.setItem("batyr_job_id", newJobId);
                if (preview) {
                    localStorage.setItem("batyr_preview", preview);
                }
                startPolling(newJobId);
            } else {
                alert("Ошибка запуска генерации. Пожалуйста, попробуйте снова.");
                handleClear();
            }
        } catch (err) {
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

    const downloadImage = async () => {
        if (!resultUrl || isDownloading) return;
        setIsDownloading(true);
        try {
            const imageBlob = await downloadImageProxy(resultUrl);
            const localUrl = URL.createObjectURL(imageBlob);
            const link = document.createElement("a");
            link.href = localUrl;
            link.download = "batyr-result.jpg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(localUrl);
        } catch (error) {
            alert(`Не удалось скачать файл: ${(error as Error).message}`);
        } finally {
            setIsDownloading(false);
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
            onDownload={downloadImage}
            isDownloading={isDownloading}
            loadingMessage={loadingMessage} // ✅ Передаем сообщение в UI
        />
    );
};

export default PhotoContainer;