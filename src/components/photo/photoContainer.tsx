// PhotoContainer.tsx
// ✅ Импортируем 'useState' для отслеживания состояния скачивания
import { useEffect, useRef, useState } from "react";
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

    // ✅ Добавляем состояние, чтобы знать, идет ли сейчас скачивание
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

    useEffect(() => {
        // @ts-ignore
        const tg = window.Telegram?.WebApp;
        if (!tg) {
            console.error("Окружение Telegram Web App не найдено!");
            return;
        }
        tg.ready();

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

        return () => stopPolling();
    }, []);

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

    // ✅ ИЗМЕНЕНО: Новая, улучшенная функция для скачивания файла
    const downloadImage = async () => {
        if (!resultUrl || isDownloading) return;

        setIsDownloading(true);

        try {
            // Скачиваем данные изображения в память
            const response = await fetch(resultUrl);
            if (!response.ok) {
                throw new Error(`Ошибка сети при загрузке изображения: ${response.status}`);
            }

            // Создаем бинарный объект (Blob)
            const imageBlob = await response.blob();

            // Создаем временную локальную ссылку на этот объект
            const localUrl = URL.createObjectURL(imageBlob);

            // Создаем невидимый элемент <a> для скачивания
            const link = document.createElement("a");
            link.href = localUrl;
            link.download = "batyr-result.jpg"; // Имя файла по умолчанию
            document.body.appendChild(link);
            link.click(); // Инициируем скачивание
            document.body.removeChild(link); // Убираем элемент со страницы

            // Освобождаем память, удаляя временную ссылку
            URL.revokeObjectURL(localUrl);

        } catch (error) {
            console.error("Ошибка при скачивании файла:", error);
            alert(`Не удалось скачать файл: ${(error as Error).message}`);
        } finally {
            // В любом случае (успех или ошибка) убираем состояние загрузки
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
            // ✅ Передаем новое состояние в UI, чтобы кнопка могла его использовать
            isDownloading={isDownloading}
        />
    );
};

export default PhotoContainer;