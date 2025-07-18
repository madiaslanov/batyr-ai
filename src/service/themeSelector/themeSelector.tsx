// src/service/themeSelector/themeSelector.tsx

import { useState, useEffect, useRef } from 'react';
import styles from './themeSelector.module.css';
import { useThemeStore } from "../../store/themeStore.ts"; // 🔄 ВОЗВРАЩАЕМ ИМПОРТ

const themeOptions = [
    { key: 'kz' as const, name: 'Батыр' },
    { key: 'ru' as const, name: 'Богатырь' },
    { key: 'en' as const, name: 'Knight' }
];

// 🔄 КОМПОНЕНТ БОЛЬШЕ НЕ ПРИНИМАЕТ PROPS ДЛЯ УПРАВЛЕНИЯ ТЕМОЙ
export const ThemeSelector = () => {
    // 🔄 ПОЛУЧАЕМ ДАННЫЕ И ФУНКЦИЮ НАПРЯМУЮ ИЗ ХРАНИЛИЩА
    const { theme: selectedTheme, setTheme } = useThemeStore();

    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const currentTheme = themeOptions.find(theme => theme.key === selectedTheme) || themeOptions[0];
    const toggleOpen = () => setIsOpen(!isOpen);

    const selectTheme = (key: 'kz' | 'ru' | 'en') => {
        setTheme(key); // 🔄 ВЫЗЫВАЕМ ФУНКЦИЮ ИЗ ХРАНИЛИЩА
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <button className={styles.trigger} onClick={toggleOpen}>
                <span>{currentTheme.name}</span>
                <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
                <div className={styles.dropdown}>
                    {themeOptions.map(option => (
                        <div
                            key={option.key}
                            className={`${styles.option} ${selectedTheme === option.key ? styles.selected : ''}`}
                            onClick={() => selectTheme(option.key)}
                        >
                            <span>{option.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};