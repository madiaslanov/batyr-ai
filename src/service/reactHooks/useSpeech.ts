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


// ✅ ИЗМЕНЕННАЯ ФУНКЦИЯ ДЛЯ ОТПРАВКИ ДАННЫХ НА СЕРВЕР
const sendAudioToServer = async (
    audioBlob: Blob,
    history: ChatMessage[]
): Promise<ServerResponse> => {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "user_voice.webm");
    // Добавляем историю чата в запрос
    formData.append("history_json", JSON.stringify(history));

    const response = await fetch("https://api.batyrai.com/api/ask-assistant", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        // Попытаемся получить текст ошибки из JSON
        const errorData = await response.json().catch(() => ({ detail: "Сервер вернул ошибку без текста" }));
        throw new Error(errorData.detail || 'Неизвестная ошибка сервера');
    }

    // Ожидаем в ответ JSON, а не просто аудио
    const data: ServerResponse = await response.json();
    return data;
};


// --- ✅ ПОЛНОСТЬЮ ПЕРЕРАБОТАННЫЙ ХУК useSpeech ---

interface UseSpeechReturn {
    isRecording: boolean;
    isProcessing: boolean;
    history: ChatMessage[]; // Теперь хук возвращает историю
    toggleRecording: () => void;
    clearHistory: () => void; // Добавили функцию для очистки истории
}

// Хук теперь принимает не просто коллбэк, а объект с коллбэками
interface UseSpeechProps {
    onNewAnswer: (audioUrl: string) => void;
    onError: (message: string) => void;
}

export const useSpeech = ({ onNewAnswer, onError }: UseSpeechProps): UseSpeechReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    // ✅ Состояние для хранения истории диалога
    const [history, setHistory] = useState<ChatMessage[]>([]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const stopRecordingAndProcess = useCallback(async () => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const startRecording = useCallback(() => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                // ✅ Главная логика после остановки записи
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    stream.getTracks().forEach(track => track.stop());

                    if (audioBlob.size < 1000) { // Проверка на пустую запись
                        console.log("Запись слишком короткая, игнорируем.");
                        return;
                    }

                    setIsProcessing(true);
                    try {
                        // Вызываем новую функцию, передавая ей текущую историю
                        const { userText, assistantText, audioBase64 } = await sendAudioToServer(audioBlob, history);

                        // Обновляем историю чата новыми сообщениями
                        setHistory(prevHistory => [
                            ...prevHistory,
                            { role: 'user', content: userText },
                            { role: 'assistant', content: assistantText },
                        ]);

                        // Воспроизводим аудио
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
                onError("Пожалуйста, разрешите доступ к микрофону.");
            });
    }, [history, onNewAnswer, onError]); // Добавляем history в зависимости

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecordingAndProcess();
            setIsRecording(false);
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecordingAndProcess]);

    // ✅ Функция для очистки истории
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