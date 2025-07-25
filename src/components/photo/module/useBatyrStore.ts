// Полностью замените содержимое файла: src/components/photo/module/useBatyrStore.ts

import { create } from 'zustand';

export type Gender = 'male' | 'female';


interface BatyrState {
    step: 1 | 2;
    userPhoto: File | null;
    preview: string | null;
    resultUrl: string | null;
    loading: boolean;
    isPolling: boolean;
    jobId: string | null;
    loadingMessage: string;
    gender: Gender;

    setStep: (step: 1 | 2) => void;
    setUserPhoto: (photo: File | null) => void;
    setPreview: (url: string | null) => void;
    setResultUrl: (url: string | null) => void;
    setLoading: (loading: boolean) => void;
    setIsPolling: (isPolling: boolean) => void;
    setJobId: (id: string | null) => void;
    setLoadingMessage: (message: string) => void;
    setGender: (gender: Gender) => void;

    clearAll: () => void;
}

export const useBatyrStore = create<BatyrState>((set) => ({

    step: 1,
    userPhoto: null,
    preview: null,
    resultUrl: null,
    loading: false,
    isPolling: false,
    jobId: null,
    loadingMessage: '',
    gender: 'male',


    setStep: (step) => set({ step }),
    setUserPhoto: (photo) => set({ userPhoto: photo }),
    setPreview: (url) => set({ preview: url }),
    setResultUrl: (url) => set({ resultUrl: url }),
    setLoading: (loading) => set({ loading }),
    setIsPolling: (isPolling) => set({ isPolling }),
    setJobId: (id) => set({ jobId: id }),
    setLoadingMessage: (message) => set({ loadingMessage: message }),
    setGender: (gender) => set({ gender }),

    clearAll: () => set({
        step: 1,
        userPhoto: null,
        preview: null,
        resultUrl: null,
        loading: false,
        isPolling: false,
        jobId: null,
        loadingMessage: '',
        gender: 'male',
    }),
}));