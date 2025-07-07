// src/hooks/useSpeech.ts
import { useState, useCallback, useRef, useEffect } from 'react';

// --- Новые константы для детектора тишины ---
// Длительность тишины в миллисекундах, после которой запись остановится
const SILENCE_DURATION_MS = 2000; // 2 секунды
// Порог громкости. Значения ниже считаются тишиной. Диапазон: 0-255. Подбирается экспериментально.
const SILENCE_THRESHOLD = 5;

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ServerResponse {
    userText: string;
    assistantText: string;
    audioBase64: string;
}

// Утилита: конвертация Base64 в Blob (без изменений)
const base64ToBlob = (base64: string, mimeType: string = 'audio/mpeg'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

// Функция отправки на сервер (без изменений)
const sendAudioToServer = async (audioBlob: Blob, history: ChatMessage[], filename: string): Promise<ServerResponse> => {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, filename);
    formData.append("history_json", JSON.stringify(history));

    // @ts-ignore
    const initData = window.Telegram?.WebApp?.initData || '';
    if (!initData) {
        throw new Error("Не удалось получить данные авторизации Telegram.");
    }

    const response = await fetch("https://api.batyrai.com/api/ask-assistant", {
        method: "POST",
        body: formData,
        headers: {
            'X-Telegram-Init-Data': initData
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Сервер вернул ошибку без текста" }));
        throw new Error(errorData.detail || 'Неизвестная ошибка сервера');
    }

    return await response.json();
};

interface UseSpeechReturn {
    isRecording: boolean;
    isProcessing: boolean;
    history: ChatMessage[];
    toggleRecording: () => void;
    clearHistory: () => void;
}

interface UseSpeechProps {
    onNewAnswer: (audioUrl: string) => void;
    onError: (message: string) => void;
}

export const useSpeech = ({ onNewAnswer, onError }: UseSpeechProps): UseSpeechReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [history, setHistory] = useState<ChatMessage[]>([]);

    // Существующие рефы
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingInfoRef = useRef({ mimeType: '', filename: '' });

    // --- Новые рефы для детектора тишины ---
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);

    // --- Новая объединенная функция остановки записи ---
    const stopRecording = useCallback(() => {
        // 1. Останавливаем сам MediaRecorder, если он пишет.
        // Это асинхронно вызовет 'onstop' для обработки аудио.
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }

        // 2. Останавливаем цикл детектора тишины
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }

        // 3. Освобождаем ресурсы Web Audio API
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }

        // 4. Останавливаем дорожки микрофона (выключаем индикатор в браузере)
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        // 5. Обновляем состояние
        setIsRecording(false);
    }, []);

    // --- Новая функция для анализа громкости ---
    const detectSilence = useCallback(() => {
        if (!analyserRef.current) return;

        // Получаем данные о текущей громкости
        const dataArray = new Uint8Array(analyserRef.current.fftSize);
        analyserRef.current.getByteTimeDomainData(dataArray);
        let maxVolume = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const v = Math.abs(dataArray[i] - 128); // 128 - это тишина
            if (v > maxVolume) maxVolume = v;
        }

        // Проверяем, есть ли тишина
        if (maxVolume < SILENCE_THRESHOLD) {
            // Если тишина и таймер не запущен, запускаем его
            if (!silenceTimerRef.current) {
                silenceTimerRef.current = setTimeout(stopRecording, SILENCE_DURATION_MS);
            }
        } else {
            // Если есть звук, сбрасываем таймер
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }
        }

        // Продолжаем проверку в следующем кадре
        animationFrameIdRef.current = requestAnimationFrame(detectSilence);
    }, [stopRecording]);

    // --- Обновленная функция старта записи ---
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream; // Сохраняем стрим для последующей остановки

            const mimeTypes = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'];
            const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
            if (!supportedMimeType) {
                onError("Ваш браузер не может записывать аудио в подходящем формате.");
                stream.getTracks().forEach(track => track.stop()); // Освобождаем микрофон
                return;
            }

            let fileExtension = 'webm';
            if (supportedMimeType.includes('ogg')) fileExtension = 'ogg';
            if (supportedMimeType.includes('mp4')) fileExtension = 'mp4';

            recordingInfoRef.current = { mimeType: supportedMimeType, filename: `user_voice.${fileExtension}` };

            // Настройка MediaRecorder (как и раньше)
            const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            mediaRecorder.onstop = async () => {
                // stream.getTracks() здесь больше не останавливаем, это делает stopRecording()
                const audioBlob = new Blob(audioChunksRef.current, { type: recordingInfoRef.current.mimeType });
                if (audioBlob.size < 1000) {
                    setIsProcessing(false); // Убедимся, что процессинг выключен
                    return;
                }
                setIsProcessing(true);
                try {
                    const { userText, assistantText, audioBase64 } = await sendAudioToServer(audioBlob, history, recordingInfoRef.current.filename);
                    setHistory(prev => [...prev, { role: 'user', content: userText }, { role: 'assistant', content: assistantText }]);
                    const answerAudioBlob = base64ToBlob(audioBase64);
                    onNewAnswer(URL.createObjectURL(answerAudioBlob));
                } catch (error) {
                    onError(`Ошибка ассистента: ${(error as Error).message}`);
                } finally {
                    setIsProcessing(false);
                }
            };

            // --- Новая часть: настройка детектора тишины ---
            const context = new AudioContext();
            audioContextRef.current = context;
            const source = context.createMediaStreamSource(stream);
            const analyser = context.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            analyserRef.current = analyser;

            // Начинаем запись и запускаем детектор
            mediaRecorder.start();
            setIsRecording(true);
            detectSilence();

        } catch (err) {
            onError("Пожалуйста, разрешите доступ к микрофону.");
        }
    }, [history, onNewAnswer, onError, detectSilence]);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording(); // Используем новую универсальную функцию остановки
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    // Эффект для очистки ресурсов при размонтировании компонента
    useEffect(() => {
        return () => {
            if (isRecording) {
                stopRecording();
            }
        };
    }, [isRecording, stopRecording]);

    const clearHistory = useCallback(() => setHistory([]), []);

    return { isRecording, isProcessing, history, toggleRecording, clearHistory };
};