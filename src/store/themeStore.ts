// src/stores/themeStore.ts

import { create } from 'zustand';

// 1. Определяем, как будет выглядеть наше хранилище
interface ThemeState {
    theme: 'kz' | 'ru' | 'en'; // Допустимые значения темы
    setTheme: (newTheme: 'kz' | 'ru' | 'en') => void; // Функция для изменения темы
}

// 2. Создаем само хранилище с помощью zustand
export const useThemeStore = create<ThemeState>((set) => ({
    // Значение по умолчанию
    theme: 'kz',
    // Функция, которая будет обновлять состояние
    setTheme: (newTheme) => set({ theme: newTheme }),
}));