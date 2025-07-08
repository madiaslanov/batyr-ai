// src/components/PhotoContainer.tsx

import { useEffect, useRef, useState } from "react";
import Photo from "./ui/photo.tsx";
import {type Gender, useBatyrStore} from "./module/useBatyrStore.ts";
import {getTaskStatus, sendPhotoToChat, startFaceSwapTask} from "./api";

const POLLING_TIMEOUT_SECONDS = 100;

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
        gender, setGender,
    } = useBatyrStore();

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
        setLoadingMessage('⏳ Батыр кейіпін жасаудамын...');
        setIsPolling(true);
        pollingStartTimeRef.current = Date.now();
        intervalRef.current = setInterval(async () => {
            if (Date.now() - (pollingStartTimeRef.current ?? 0) > POLLING_TIMEOUT_SECONDS * 1000) {
                alert("Күту уақыты тым ұзақ. Қайтадан жасап көріңіз.");
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
                    alert(`Ошибка: ${data.error || "Белгісіз қате"}`);
                    handleClear();
                    return;
                }
            } catch (err) {
                alert("Статус қатесі. Қайтадан көріңіз.");
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
            setLoadingMessage("✅ Суретіңіз дайын");
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
            const data = await startFaceSwapTask(userPhoto, gender);
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
            alert(`Фото жіберу мүмкін емес: ${(err as Error).message}`);
            handleClear();
        }
    };

    // Функция handleClear используется кнопкой "Очистить" и должна сбрасывать все.
    // Она работает правильно. Проблема была в ее вызове из handleFileChange.
    const handleClear = () => {
        stopPolling();
        clearLocalStorage();
        clearAll();
    };


    // =================================================================
    // ИСПРАВЛЕННАЯ ФУНКЦИЯ
    // =================================================================
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // НЕ вызываем handleClear() или clearAll()

            // Вместо этого, вручную сбрасываем только то, что нужно:
            // предыдущие результаты и состояние загрузки.
            stopPolling();
            clearLocalStorage();
            setResultUrl(null);
            setJobId(null);
            setLoading(false);
            setStep(1); // Убедимся, что мы на первом шаге

            // А теперь устанавливаем новое фото. Состояние `gender` не трогаем.
            const previewUrl = URL.createObjectURL(file);
            setUserPhoto(file);
            setPreview(previewUrl);
        }
    };
    // =================================================================

    const handleSendToChat = async () => {
        if (!resultUrl || isSending) return;
        setIsSending(true);
        try {
            await sendPhotoToChat(resultUrl);
            alert("Дайын! Фотоны ботпен чатқа жібердім. 🚀");
        } catch (error) {
            alert(`Фото жіберу мүмкін болмады: ${(error as Error).message}`);
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
            userPhoto={userPhoto}
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