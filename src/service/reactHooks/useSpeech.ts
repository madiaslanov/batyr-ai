// src/hooks/useSpeech.ts
import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ServerResponse {
    userText: string;
    assistantText: string;
    audioBase64: string;
}

const base64ToBlob = (base64: string, mimeType: string = 'audio/mpeg'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

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
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingInfoRef = useRef({ mimeType: '', filename: '' });

    const stopRecordingAndProcess = useCallback(() => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const startRecording = useCallback(() => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mimeTypes = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'];
                const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
                if (!supportedMimeType) {
                    onError("Ваш браузер не может записывать аудио в подходящем формате.");
                    return;
                }

                let fileExtension = 'webm';
                if (supportedMimeType.includes('ogg')) fileExtension = 'ogg';
                if (supportedMimeType.includes('mp4')) fileExtension = 'mp4';

                recordingInfoRef.current = { mimeType: supportedMimeType, filename: `user_voice.${fileExtension}` };

                const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMimeType });
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];
                mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
                mediaRecorder.onstop = async () => {
                    stream.getTracks().forEach(track => track.stop());
                    const audioBlob = new Blob(audioChunksRef.current, { type: recordingInfoRef.current.mimeType });
                    if (audioBlob.size < 1000) {
                        setIsRecording(false);
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
                mediaRecorder.start();
                setIsRecording(true);
            })
            .catch(err => onError("Пожалуйста, разрешите доступ к микрофону."));
    }, [history, onNewAnswer, onError]);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecordingAndProcess();
            setIsRecording(false);
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecordingAndProcess]);

    const clearHistory = useCallback(() => setHistory([]), []);

    return { isRecording, isProcessing, history, toggleRecording, clearHistory };
};