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
    history: ChatMessage[],
    // Добавляем filename как аргумент
    filename: string
): Promise<ServerResponse> => {
    const formData = new FormData();
    // Используем динамическое имя файла
    formData.append("audio_file", audioBlob, filename);
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
    // Реф для хранения выбранного MIME-типа и имени файла
    const recordingInfoRef = useRef({ mimeType: '', filename: '' });


    const stopRecordingAndProcess = useCallback(async () => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const startRecording = useCallback(() => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                // --- ⭐ УЛУЧШЕНИЕ: Выбор лучшего поддерживаемого MIME-типа ---
                const mimeTypes = [
                    'audio/webm;codecs=opus', // Наиболее предпочтительный
                    'audio/ogg;codecs=opus',
                    'audio/webm', // Фоллбэк
                ];
                const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

                if (!supportedMimeType) {
                    onError("Ваш браузер не может записывать аудио в подходящем формате.");
                    return;
                }

                // Логируем для отладки
                console.log(`Using supported MIME type: ${supportedMimeType}`);

                // Определяем расширение файла для отправки на сервер
                const fileExtension = supportedMimeType.includes('ogg') ? 'ogg' : 'webm';
                recordingInfoRef.current = {
                    mimeType: supportedMimeType,
                    filename: `user_voice.${fileExtension}`
                };
                // --- ⭐ КОНЕЦ УЛУЧШЕНИЯ ---

                const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMimeType });
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                // ✅ Главная логика после остановки записи
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: recordingInfoRef.current.mimeType });
                    stream.getTracks().forEach(track => track.stop());

                    if (audioBlob.size < 1000) { // Проверка на пустую запись
                        console.log("Запись слишком короткая, игнорируем.");
                        setIsRecording(false); // Убедимся, что состояние сброшено
                        return;
                    }

                    setIsProcessing(true);
                    try {
                        // Вызываем новую функцию, передавая ей текущую историю и имя файла
                        const { userText, assistantText, audioBase64 } = await sendAudioToServer(
                            audioBlob,
                            history,
                            recordingInfoRef.current.filename
                        );

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
                console.error("Ошибка доступа к микрофону:", err);
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