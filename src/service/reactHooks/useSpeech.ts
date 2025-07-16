
import { useState, useRef, useCallback } from 'react';

const API_BASE_URL = "https://api.batyrai.com";

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

interface UseSpeechParams {
    onNewAnswer: (audioUrl: string) => void;
    onError: (message: string) => void;
    silenceDuration?: number;
}

export const useSpeech = ({
                              onNewAnswer,
                              onError,
                              silenceDuration = 1500,
                          }: UseSpeechParams) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [history, setHistory] = useState<Message[]>([]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);


    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsRecording(false);
    }, []);

    const checkForSilence = useCallback(() => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        let isSilent = true;
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i] > 2) {
                isSilent = false;
                break;
            }
        }

        if (isSilent) {
            if (!silenceTimerRef.current) {
                silenceTimerRef.current = setTimeout(() => {
                    console.log("Тишина обнаружена, останавливаю запись.");
                    stopRecording();
                }, silenceDuration);
            }
        } else {
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }
        }

        animationFrameRef.current = requestAnimationFrame(checkForSilence);
    }, [silenceDuration, stopRecording]);


    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsRecording(true);
            audioChunksRef.current = [];

            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            analyserRef.current = analyser;

            animationFrameRef.current = requestAnimationFrame(checkForSilence);

            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                if (audioChunksRef.current.length === 0) {
                    setIsProcessing(false);
                    return;
                };

                setIsProcessing(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('audio_file', audioBlob, 'recording.webm');
                const historyForApi = history.map(msg => ({ role: msg.role, content: msg.text }));
                formData.append('history_json', JSON.stringify(historyForApi));

                try {
                    const response = await fetch(`${API_BASE_URL}/api/ask-assistant`, {
                        method: 'POST',
                        headers: { 'X-Telegram-Init-Data': window.Telegram.WebApp.initData },
                        body: formData,
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || "Ошибка сервера");
                    }

                    const data = await response.json();
                    setHistory(prev => [...prev, { role: 'user', text: data.userText }, { role: 'assistant', text: data.assistantText }]);
                    const audioBytes = Uint8Array.from(atob(data.audioBase64), c => c.charCodeAt(0));
                    const audioBlobResponse = new Blob([audioBytes], { type: 'audio/mpeg' });
                    const audioUrl = URL.createObjectURL(audioBlobResponse);
                    onNewAnswer(audioUrl);

                } catch (e: any) {
                    onError(e.message || "Не удалось обработать запрос");
                } finally {
                    setIsProcessing(false);
                }
            };
            mediaRecorderRef.current.start();
        } catch (err) {
            console.error("Ошибка доступа к микрофону:", err);
            onError("Не удалось получить доступ к микрофону. Пожалуйста, разрешите его в настройках браузера.");
        }
    };

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else if (!isProcessing) {
            startRecording();
        }
    }, [isRecording, isProcessing, stopRecording]);

    return { isRecording, isProcessing, history, toggleRecording };
};