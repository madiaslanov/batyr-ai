import { useEffect, useRef } from "react";
import { useBatyrStore } from "./module/useBatyrStore.ts";
import { getTaskResult, postFaceSwap } from "./api";
import Photo from "./ui/photo.tsx";

const EXPIRATION_MINUTES = 10;

const isTaskExpired = (time: string | null) => {
    if (!time) return true;
    return Date.now() - parseInt(time, 10) > EXPIRATION_MINUTES * 60 * 1000;
};

const PhotoContainer = () => {
    const {
        step, setStep,
        userPhoto, setUserPhoto,
        preview, setPreview,
        loading, setLoading,
        resultUrl, setResultUrl,
        taskId, setTaskId,
        taskTime, setTaskTime,
        clearAll,
        isPolling, setIsPolling,
        isGenerating, setIsGenerating,
    } = useBatyrStore();

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // ------------------ INIT ------------------
    useEffect(() => {
        const storedTaskId = localStorage.getItem("batyr_task_id");
        const storedTaskTime = localStorage.getItem("batyr_task_time");
        const storedResultUrl = localStorage.getItem("batyr_result_url");
        const storedPreview = localStorage.getItem("batyr_preview");
        const isGen = localStorage.getItem("batyr_generating") === "true";
        const expired = isTaskExpired(storedTaskTime);

        if (storedResultUrl && storedPreview && !expired) {
            setPreview(storedPreview);
            setResultUrl(storedResultUrl);
            setStep(2);
            setLoading(false);
            return;
        }

        if (storedTaskId && !expired) {
            setTaskId(storedTaskId);
            setTaskTime(storedTaskTime!);
            setPreview(storedPreview || null);
            setResultUrl(null);
            setStep(2);
            setLoading(true);

            if (!isPolling) startPolling(storedTaskId);
            return;
        }

        if (isGen) {
            setPreview(storedPreview || null);
            setStep(2);
            setLoading(true);
            return;
        }

        clearAll();
        return () => stopPolling();
    }, []);

    // ------------------ POLLING ------------------
    const startPolling = (id: string) => {
        if (isPolling || intervalRef.current) return;

        setIsPolling(true);
        let attempts = 0;
        const maxAttempts = 24;

        intervalRef.current = setInterval(async () => {
            attempts++;
            try {
                const res = await getTaskResult(id);
                const status = res?.data?.status;
                const imageUrl = res?.data?.output?.image_url;

                if (imageUrl) {
                    stopPolling();
                    setResultUrl(imageUrl);
                    setLoading(false);
                    localStorage.setItem("batyr_result_url", imageUrl);
                    localStorage.removeItem("batyr_task_id");
                    localStorage.removeItem("batyr_task_time");
                    localStorage.removeItem("batyr_generating");
                    return;
                }

                if (status === "Failed") {
                    stopPolling();
                    setLoading(false);
                    setStep(1);
                    localStorage.removeItem("batyr_generating");
                    alert("❌ Ошибка генерации изображения");
                    return;
                }

                if (attempts >= maxAttempts) {
                    stopPolling();
                    setLoading(false);
                    setStep(1);
                    localStorage.removeItem("batyr_generating");
                    alert("⏱️ Время ожидания истекло");
                }

                console.log(`⌛ Статус: ${status}, попытка ${attempts}`);
            } catch (err) {
                console.error("Ошибка при опросе:", err);
            }
        }, 5000);
    };

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPolling(false);
    };

    // ------------------ GENERATE ------------------
    const handleNext = async () => {
        if (!userPhoto || loading || resultUrl || isGenerating) return;

        const expired = isTaskExpired(taskTime);

        if (taskId && !expired) {
            setStep(2);
            setLoading(true);
            if (!isPolling) startPolling(taskId);
            return;
        }

        setStep(2);
        setLoading(true);
        setResultUrl(null);
        localStorage.setItem("batyr_generating", "true");
        setIsGenerating(true);

        try {
            const data = await postFaceSwap(userPhoto);
            const directUrl = data?.data?.output?.image_url;
            const newTaskId = data?.data?.task_id;

            if (directUrl) {
                setResultUrl(directUrl);
                localStorage.setItem("batyr_result_url", directUrl);
                setLoading(false);
                localStorage.removeItem("batyr_generating");
            } else if (newTaskId) {
                const now = Date.now().toString();
                setTaskId(newTaskId);
                setTaskTime(now);
                localStorage.setItem("batyr_task_id", newTaskId);
                localStorage.setItem("batyr_task_time", now);
                localStorage.removeItem("batyr_generating");
                startPolling(newTaskId);
            } else {
                alert("❌ Ошибка запуска генерации");
                setStep(1);
                setLoading(false);
                localStorage.removeItem("batyr_generating");
            }
        } catch (err) {
            console.error("Ошибка запроса:", err);
            alert("Ошибка отправки");
            setStep(1);
            setLoading(false);
            localStorage.removeItem("batyr_generating");
        } finally {
            setIsGenerating(false);
        }
    };

    // ------------------ CLEAR ------------------
    const handleClear = () => {
        stopPolling();
        clearAll();
        localStorage.removeItem("batyr_task_id");
        localStorage.removeItem("batyr_task_time");
        localStorage.removeItem("batyr_result_url");
        localStorage.removeItem("batyr_preview");
        localStorage.removeItem("batyr_generating");
        setIsGenerating(false);
        setStep(1);
    };

    // ------------------ UPLOAD ------------------
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setUserPhoto(file);
            setPreview(previewUrl);
            localStorage.setItem("batyr_preview", previewUrl);
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
