// src/hooks/useSpeech.ts
import { useState, useCallback, useRef } from 'react';

// --- Типы для нашего чата ---
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// --- Тип для ответа от сервера ---
interface ServerResponse {
    userText: string;
    assistantText: string;
    audioBase64: string;
}

// --- Функция для декодирования аудио из Base64 в Blob ---
const base64ToBlob = (base64: string, mimeType: string = 'audio/mpeg'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};


const sendAudioToServer = async (
    audioBlob: Blob,
    history: ChatMessage[],
    filename: string
): Promise<ServerResponse> => {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, filename);
    formData.append("history_json", JSON.stringify(history));

    const response = await fetch("https://api.batyrai.com/api/ask-assistant", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Сервер вернул ошибку без текста" }));
        throw new Error(errorData.detail || 'Неизвестная ошибка сервера');
    }

    const data: ServerResponse = await response.json();
    return data;
};


// --- Хук useSpeech ---

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

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingInfoRef = useRef({ mimeType: '', filename: '' });


    const stopRecordingAndProcess = useCallback(async () => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const startRecording = useCallback(() => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                // --- ⭐ ГЛАВНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ ⭐ ---
                // Добавляем 'audio/mp4' для поддержки Safari / iOS
                const mimeTypes = [
                    'audio/webm;codecs=opus', // Предпочтительный для Chrome/Android
                    'audio/ogg;codecs=opus',  // Предпочтительный для Firefox
                    'audio/mp4',              // Фоллбэк для Safari/iOS
                    'audio/webm',             // Общий фоллбэк
                ];
                const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

                // Если ни один формат не поддерживается, выдаем ошибку
                if (!supportedMimeType) {
                    onError("Ваш браузер не может записывать аудио в подходящем формате.");
                    return;
                }

                console.log(`Using supported MIME type: ${supportedMimeType}`);

                // ⭐ Улучшаем логику определения расширения файла
                let fileExtension = 'webm';
                if (supportedMimeType.includes('ogg')) fileExtension = 'ogg';
                if (supportedMimeType.includes('mp4')) fileExtension = 'mp4';

                recordingInfoRef.current = {
                    mimeType: supportedMimeType,
                    filename: `user_voice.${fileExtension}`
                };
                // --- ⭐ КОНЕЦ ИЗМЕНЕНИЙ ---

                const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMimeType });
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: recordingInfoRef.current.mimeType });
                    stream.getTracks().forEach(track => track.stop());

                    if (audioBlob.size < 1000) {
                        console.log("Запись слишком короткая, игнорируем.");
                        setIsRecording(false);
                        return;
                    }

                    setIsProcessing(true);
                    try {
                        const { userText, assistantText, audioBase64 } = await sendAudioToServer(
                            audioBlob,
                            history,
                            recordingInfoRef.current.filename
                        );

                        setHistory(prevHistory => [
                            ...prevHistory,
                            { role: 'user', content: userText },
                            { role: 'assistant', content: assistantText },
                        ]);

                        const answerAudioBlob = base64ToBlob(audioBase64);
                        const audioUrl = URL.createObjectURL(answerAudioBlob);
                        onNewAnswer(audioUrl);

                    } catch (error) {
                        const errorMessage = (error as Error).message;
                        onError(`Ошибка ассистента: ${errorMessage}`);
                    } finally {
                        setIsProcessing(false);
                    }
                };

                mediaRecorder.start();
                setIsRecording(true);
            })
            .catch(err => {
                console.error("Ошибка доступа к микрофону:", err);
                onError("Пожалуйста, разрешите доступ к микрофону.");
            });
    }, [history, onNewAnswer, onError]);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecordingAndProcess();
            setIsRecording(false);
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecordingAndProcess]);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    return {
        isRecording,
        isProcessing,
        history,
        toggleRecording,
        clearHistory,
    };
};