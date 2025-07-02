// PhotoContainer.tsx
import { useEffect, useRef } from "react";
// ✅ Импортируем обновленное хранилище
import { useBatyrStore } from "./module/useBatyrStore.ts";
// ✅ Импортируем новые функции API
import { getTaskStatus, startFaceSwapTask } from "./api";
import Photo from "./ui/photo.tsx";

// Общий таймаут для опроса задачи (например, 3 минуты)
const POLLING_TIMEOUT_SECONDS = 180;

const PhotoContainer = () => {
    // ✅ Получаем обновленные состояния и сеттеры из Zustand
    const {
        step, setStep,
        userPhoto, setUserPhoto,
        preview, setPreview,
        loading, setLoading,
        resultUrl, setResultUrl,
        jobId, setJobId, // Используем jobId вместо taskId и taskTime
        clearAll,
        isPolling, setIsPolling,
    } = useBatyrStore();

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollingStartTimeRef = useRef<number | null>(null); // Для отслеживания таймаута

    // Функция для очистки временных данных из localStorage
    const clearLocalStorage = () => {
        localStorage.removeItem("batyr_job_id");
        localStorage.removeItem("batyr_result_url");
        localStorage.removeItem("batyr_preview");
    };

    // ------------------ POLLING (Опрос результата) ------------------
    const startPolling = (currentJobId: string) => {
        if (isPolling || intervalRef.current) return;

        console.log(`🚀 Начинаем опрос для Job ID: ${currentJobId}`);
        setIsPolling(true);
        pollingStartTimeRef.current = Date.now(); // Запоминаем время начала

        intervalRef.current = setInterval(async () => {
            // Проверка на общий таймаут опроса
            if (Date.now() - (pollingStartTimeRef.current ?? 0) > POLLING_TIMEOUT_SECONDS * 1000) {
                console.error("⏱️ Таймаут опроса истек.");
                alert("Время ожидания результата истекло. Пожалуйста, попробуйте еще раз.");
                handleClear(); // Полный сброс
                return;
            }

            try {
                // ✅ Вызываем новую функцию API для получения статуса
                const data = await getTaskStatus(currentJobId);
                console.log(`⌛ Статус задачи [${currentJobId}]: ${data.status}`);

                if (data.status === "completed") {
                    console.log("✅ Результат получен!", data.result_url);
                    stopPolling();
                    setResultUrl(data.result_url);
                    setLoading(false);
                    // Сохраняем готовый результат в localStorage
                    localStorage.setItem("batyr_result_url", data.result_url);
                    if (preview) {
                        localStorage.setItem("batyr_preview", preview);
                    }
                    // Задача завершена, удаляем временный ID
                    localStorage.removeItem("batyr_job_id");
                    return;
                }

                if (data.status === "failed") {
                    console.error("❌ Задача завершилась с ошибкой:", data.error);
                    alert(`Ошибка генерации: ${data.error || "Неизвестная ошибка на сервере"}`);
                    handleClear();
                    return;
                }

                // Если статус "accepted" или "processing", просто продолжаем опрос...

            } catch (err) {
                console.error("🔥 Ошибка при опросе статуса:", err);
                // Здесь можно добавить логику повторных попыток, если нужно
                alert("Произошла ошибка соединения при проверке статуса. Попробуйте обновить страницу.");
                handleClear(); // Сбрасываем при критической ошибке опроса
            }
        }, 5000); // Опрашиваем каждые 5 секунд
    };

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPolling(false);
        pollingStartTimeRef.current = null; // Сбрасываем таймер
        console.log("🛑 Опрос остановлен.");
    };

    // ------------------ INIT (При загрузке страницы) ------------------
    useEffect(() => {
        const storedJobId = localStorage.getItem("batyr_job_id");
        const storedResultUrl = localStorage.getItem("batyr_result_url");
        const storedPreview = localStorage.getItem("batyr_preview");

        // 1. Если есть ГОТОВЫЙ результат, сразу его показываем
        if (storedResultUrl && storedPreview) {
            console.log("Восстановление из localStorage: найден готовый результат.");
            setPreview(storedPreview);
            setResultUrl(storedResultUrl);
            setStep(2);
            setLoading(false);
            return;
        }

        // 2. Если есть АКТИВНАЯ задача, возобновляем опрос
        if (storedJobId) {
            console.log("Восстановление из localStorage: найдена активная задача.");
            setJobId(storedJobId);
            setPreview(storedPreview || null);
            setStep(2);
            setLoading(true);
            startPolling(storedJobId);
            return;
        }

        // 3. Если ничего нет, просто убедимся, что состояние чистое
        console.log("Новая сессия, состояние чистое.");
        handleClear();

        // Очищаем интервал при размонтировании компонента, чтобы избежать утечек памяти
        return () => stopPolling();
    }, []); // Пустой массив зависимостей = запуск только один раз при монтировании

    // ------------------ GENERATE (Запуск новой генерации) ------------------
    const handleNext = async () => {
        if (!userPhoto || loading) return;

        // Переходим к экрану загрузки
        setStep(2);
        setLoading(true);
        setResultUrl(null); // Сбрасываем старый результат

        // Очищаем localStorage от данных предыдущей задачи
        clearLocalStorage();

        try {
            console.log("🚀 Запускаем задачу на бэкенде...");
            // ✅ Вызываем новую функцию API для старта задачи
            const data = await startFaceSwapTask(userPhoto);
            const newJobId = data.job_id;

            if (newJobId) {
                setJobId(newJobId);
                // Сохраняем ID задачи в localStorage для возобновления после перезагрузки
                localStorage.setItem("batyr_job_id", newJobId);
                if (preview) {
                    localStorage.setItem("batyr_preview", preview);
                }
                // Начинаем опрос
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

    // ------------------ HANDLERS (Обработчики UI) ------------------
    const handleClear = () => {
        stopPolling();      // Останавливаем любой активный опрос
        clearLocalStorage(); // Очищаем localStorage
        clearAll();         // Очищаем состояние Zustand
        // setStep(1) уже вызывается внутри clearAll()
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleClear(); // Полный сброс при выборе нового файла
            const previewUrl = URL.createObjectURL(file);
            setUserPhoto(file);
            setPreview(previewUrl);
        }
    };

    // Функция скачивания остается без изменений
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