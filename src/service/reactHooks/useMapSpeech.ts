// src/hooks/useSpeech.ts
import { useState, useCallback, useRef, useEffect } from 'react';

// Интерфейс для сообщений в чате
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Пропсы для хука
interface UseSpeechProps {
    onNewAnswer: (audioUrl: string) => void;
    onError: (message: string) => void;
    apiUrl: string;
}

const SILENCE_DURATION_MS = 2000;
const SILENCE_THRESHOLD = 5;

export const useSpeech = ({ onNewAnswer, onError, apiUrl }: UseSpeechProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [history, setHistory] = useState<ChatMessage[]>([]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);

    const sendAudioToServer = async (audioBlob: Blob) => {
        if (audioBlob.size < 1000) {
            setIsRecording(false);
            return;
        }
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'recording.webm');
        formData.append('history_json', JSON.stringify(history));

        try {
            // @ts-ignore
            const initData = window.Telegram?.WebApp?.initData || '';
            if (!initData) throw new Error("Не удалось получить данные авторизации Telegram.");

            const response = await fetch(`${apiUrl}/api/ask-assistant`, {
                method: 'POST',
                headers: { 'X-Telegram-Init-Data': initData },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка сервера');
            }

            const result = await response.json();
            setHistory(prev => [...prev, { role: 'user', content: result.userText }, { role: 'assistant', content: result.assistantText }]);
            onNewAnswer(`data:audio/mp3;base64,${result.audioBase64}`);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Неизвестная ошибка');
        } finally {
            setIsProcessing(false);
        }
    };

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        audioContextRef.current?.close().catch(() => {});
        streamRef.current?.getTracks().forEach(track => track.stop());
        setIsRecording(false);
    }, []);

    const detectSilence = useCallback(() => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.fftSize);
        analyserRef.current.getByteTimeDomainData(dataArray);
        let maxVolume = 0;
        for (const v of dataArray) maxVolume = Math.max(maxVolume, Math.abs(v - 128));

        if (maxVolume < SILENCE_THRESHOLD) {
            if (!silenceTimerRef.current) silenceTimerRef.current = setTimeout(stopRecording, SILENCE_DURATION_MS);
        } else if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        animationFrameIdRef.current = requestAnimationFrame(detectSilence);
    }, [stopRecording]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            audioChunksRef.current = [];
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = recorder;
            recorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            recorder.onstop = () => sendAudioToServer(new Blob(audioChunksRef.current, { type: 'audio/webm' }));

            const context = new AudioContext();
            audioContextRef.current = context;
            const source = context.createMediaStreamSource(stream);
            const analyser = context.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            analyserRef.current = analyser;

            recorder.start();
            setIsRecording(true);
            detectSilence();
        } catch (err) {
            onError('Пожалуйста, разрешите доступ к микрофону.');
            setIsRecording(false);
        }
    }, [detectSilence, onError]);

    const toggleRecording = useCallback(() => {
        isRecording ? stopRecording() : startRecording();
    }, [isRecording, startRecording, stopRecording]);

    useEffect(() => () => { if (isRecording) stopRecording(); }, [isRecording, stopRecording]);

    return { isRecording, isProcessing, history, toggleRecording, clearHistory: () => setHistory([]) };
};