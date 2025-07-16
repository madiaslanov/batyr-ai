// Полностью замените содержимое файла: src/components/photo/photoContainer.tsx

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Photo from "./ui/photo.tsx";
import { type Gender, useBatyrStore } from "./module/useBatyrStore.ts";
import { getTaskStatus, sendPhotoToChat, startFaceSwapTask } from "./api";

const POLLING_TIMEOUT_SECONDS = 120;

const PhotoContainer = () => {
    const { t, i18n } = useTranslation();
    const {
        step, setStep, userPhoto, setUserPhoto, preview, setPreview, loading, setLoading,
        resultUrl, setResultUrl, setJobId, clearAll, isPolling, setIsPolling,
        loadingMessage, setLoadingMessage, gender, setGender,
    } = useBatyrStore();

    const [isSending, setIsSending] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollingStartTimeRef = useRef<number | null>(null);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPolling(false);
        pollingStartTimeRef.current = null;
    }, [setIsPolling]);

    const handleClear = useCallback(() => {
        stopPolling();
        localStorage.removeItem("batyr_job_id");
        localStorage.removeItem("batyr_result_url");
        localStorage.removeItem("batyr_preview");
        clearAll();
    }, [stopPolling, clearAll]);


    const startPolling = useCallback((currentJobId: string) => {
        if (isPolling || intervalRef.current) return;

        setLoadingMessage(t('generatingMessage'));
        setIsPolling(true);
        pollingStartTimeRef.current = Date.now();

        intervalRef.current = setInterval(async () => {
            if (Date.now() - (pollingStartTimeRef.current ?? 0) > POLLING_TIMEOUT_SECONDS * 1000) {
                alert(t('errorTimeout')); // FIX: Возвращаем alert
                handleClear();
                return;
            }
            try {
                const data = await getTaskStatus(currentJobId, i18n.language);
                if (data.message) { setLoadingMessage(data.message); }

                if (data.status === "completed") {
                    stopPolling();
                    setResultUrl(data.result_url);
                    setLoading(false);
                    localStorage.setItem("batyr_result_url", data.result_url);
                    if (preview) { localStorage.setItem("batyr_preview", preview); }
                    localStorage.removeItem("batyr_job_id");
                    setLoadingMessage(t('photoReadyMessage'));
                } else if (data.status === "failed") {
                    alert(data.error || t('errorUnknown')); // FIX: Возвращаем alert
                    handleClear();
                }
            } catch (err) {
                alert((err as Error).message); // FIX: Возвращаем alert
                handleClear();
            }
        }, 5000);
    }, [isPolling, setLoadingMessage, t, setIsPolling, i18n.language, stopPolling, setResultUrl, setLoading, preview, handleClear]);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg) tg.ready();

        const storedJobId = localStorage.getItem("batyr_job_id");
        const storedResultUrl = localStorage.getItem("batyr_result_url");
        const storedPreview = localStorage.getItem("batyr_preview");

        if (storedResultUrl && storedPreview) {
            setPreview(storedPreview);
            setResultUrl(storedResultUrl);
            setStep(2);
            setLoading(false);
            setLoadingMessage(t('photoReadyMessage'));
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

        return () => stopPolling();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNext = async () => {
        if (!userPhoto || loading) return;
        setStep(2);
        setLoading(true);
        setResultUrl(null);
        localStorage.removeItem("batyr_job_id");
        localStorage.removeItem("batyr_result_url");

        try {
            const data = await startFaceSwapTask(userPhoto, gender, i18n.language);
            setJobId(data.job_id);
            localStorage.setItem("batyr_job_id", data.job_id);
            if (preview) { localStorage.setItem("batyr_preview", preview); }
            startPolling(data.job_id);
        } catch (err) {
            alert((err as Error).message); // FIX: Возвращаем alert
            handleClear();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleClear();
            const previewUrl = URL.createObjectURL(file);
            setUserPhoto(file);
            setPreview(previewUrl);
            setStep(1);
        }
    };

    const handleSendToChat = async () => {
        if (!resultUrl || isSending) return;
        setIsSending(true);
        try {
            await sendPhotoToChat(resultUrl, i18n.language);
            alert(t('photoSentSuccess')); // FIX: alert об успехе
        } catch (error) {
            alert((error as Error).message); // FIX: Возвращаем alert
        } finally {
            setIsSending(false);
        }
    };

    const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGender(e.target.value as Gender);
    };

    return (
        <Photo
            step={step}
            preview={preview}
            loading={loading}
            resultUrl={resultUrl}
            userPhoto={userPhoto} /* Передаем userPhoto для дизейбла кнопки */
            onNext={handleNext}
            onClear={handleClear}
            onFileChange={handleFileChange}
            onSendToChat={handleSendToChat}
            isSending={isSending}
            loadingMessage={loadingMessage}
            gender={gender}
            onGenderChange={handleGenderChange}
        />
    );
};

export default PhotoContainer;