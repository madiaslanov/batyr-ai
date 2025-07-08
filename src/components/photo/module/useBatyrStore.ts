// src/module/useBatyrStore.ts
import { create } from 'zustand';

// Определяем типы для пола
export type Gender = 'male' | 'female';

// Определяем интерфейс для нашего состояния
interface BatyrState {
    step: 1 | 2;
    userPhoto: File | null;
    preview: string | null;
    resultUrl: string | null;
    loading: boolean;
    isPolling: boolean;
    jobId: string | null;
    loadingMessage: string;
    gender: Gender; // Состояние для хранения пола

    // Методы для изменения состояния (сеттеры)
    setStep: (step: 1 | 2) => void;
    setUserPhoto: (photo: File | null) => void;
    setPreview: (url: string | null) => void;
    setResultUrl: (url: string | null) => void;
    setLoading: (loading: boolean) => void;
    setIsPolling: (isPolling: boolean) => void;
    setJobId: (id: string | null) => void;
    setLoadingMessage: (message: string) => void;
    setGender: (gender: Gender) => void; // Сеттер для пола

    // Метод для полного сброса состояния
    clearAll: () => void;
}

// Создаем хранилище
export const useBatyrStore = create<BatyrState>((set) => ({
    // Устанавливаем начальное состояние
    step: 1,
    userPhoto: null,
    preview: null,
    resultUrl: null,
    loading: false,
    isPolling: false,
    jobId: null,
    loadingMessage: '⏳ Фото генерциясы...',
    gender: 'male', // Начальное значение

    // Определяем сеттеры
    setStep: (step) => set({ step }),
    setUserPhoto: (photo) => set({ userPhoto: photo }),
    setPreview: (url) => set({ preview: url }),
    setResultUrl: (url) => set({ resultUrl: url }),
    setLoading: (loading) => set({ loading }),
    setIsPolling: (isPolling) => set({ isPolling }),
    setJobId: (id) => set({ jobId: id }),
    setLoadingMessage: (message) => set({ loadingMessage: message }),
    setGender: (gender) => set({ gender }), // Реализация сеттера

    // Метод clearAll теперь сбрасывает и новое состояние
    clearAll: () => set({
        step: 1,
        userPhoto: null,
        preview: null,
        resultUrl: null,
        loading: false,
        isPolling: false,
        jobId: null,
        loadingMessage: '⏳ Фото генерциясы...',
        gender: 'male', // Сбрасываем к значению по умолчанию
    }),
}));