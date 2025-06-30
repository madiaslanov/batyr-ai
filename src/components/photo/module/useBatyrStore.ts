import { create } from "zustand";

const EXPIRATION_MINUTES = 10;

type State = {
    step: 1 | 2;
    userPhoto: File | null;
    preview: string | null;
    resultUrl: string | null;
    loading: boolean;
    taskId: string | null;
    taskTime: string | null;
    isPolling: boolean;
    isGenerating: boolean;

    // setters
    setStep: (step: 1 | 2) => void;
    setUserPhoto: (file: File | null) => void;
    setPreview: (url: string | null) => void;
    setResultUrl: (url: string | null) => void;
    setLoading: (isLoading: boolean) => void;
    setTaskId: (id: string | null) => void;
    setTaskTime: (time: string | null) => void;
    setIsPolling: (is: boolean) => void;
    setIsGenerating: (is: boolean) => void;
    clearAll: () => void;
};

export const useBatyrStore = create<State>((set) => {
    // инициализация из localStorage
    const storedTaskId = localStorage.getItem("batyr_task_id");
    const storedTaskTime = localStorage.getItem("batyr_task_time");
    const storedResultUrl = localStorage.getItem("batyr_result_url");

    const isExpired = (time: string | null) => {
        if (!time) return true;
        return Date.now() - parseInt(time, 10) > EXPIRATION_MINUTES * 60 * 1000;
    };

    const validResultUrl = storedResultUrl && !isExpired(storedTaskTime) ? storedResultUrl : null;
    const validTaskId = storedTaskId && !isExpired(storedTaskTime) ? storedTaskId : null;
    const validTaskTime = validTaskId ? storedTaskTime : null;

    return {
        step: validResultUrl || validTaskId ? 2 : 1,
        userPhoto: null,
        preview: null,
        resultUrl: validResultUrl,
        loading: !!validTaskId && !validResultUrl,
        taskId: validTaskId,
        taskTime: validTaskTime,
        isPolling: false,
        isGenerating: false,

        setStep: (step) => set({ step }),
        setUserPhoto: (file) => set({ userPhoto: file }),
        setPreview: (url) => set({ preview: url }),
        setResultUrl: (url) => {
            if (url) {
                localStorage.setItem("batyr_result_url", url);
            } else {
                localStorage.removeItem("batyr_result_url");
            }
            set({ resultUrl: url });
        },
        setLoading: (loading) => set({ loading }),
        setTaskId: (id) => {
            if (id) {
                localStorage.setItem("batyr_task_id", id);
            } else {
                localStorage.removeItem("batyr_task_id");
            }
            set({ taskId: id });
        },
        setTaskTime: (time) => {
            if (time) {
                localStorage.setItem("batyr_task_time", time);
            } else {
                localStorage.removeItem("batyr_task_time");
            }
            set({ taskTime: time });
        },
        setIsPolling: (is) => set({ isPolling: is }),
        setIsGenerating: (is) => set({ isGenerating: is }),
        clearAll: () => {
            localStorage.removeItem("batyr_task_id");
            localStorage.removeItem("batyr_task_time");
            localStorage.removeItem("batyr_result_url");
            set({
                step: 1,
                userPhoto: null,
                preview: null,
                resultUrl: null,
                loading: false,
                taskId: null,
                taskTime: null,
                isPolling: false,
                isGenerating: false,
            });
        },
    };
});
