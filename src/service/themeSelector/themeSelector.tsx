// src/service/themeSelector/themeSelector.tsx

import { useState, useEffect, useRef } from 'react';
import styles from './themeSelector.module.css';
import {useThemeStore} from "../../store/themeStore.ts"; // 1. Импортируем наше хранилище

const themeOptions = [
    { key: 'kz' as const, name: 'Батыр' },
    { key: 'ru' as const, name: 'Богатырь' },
    { key: 'en' as const, name: 'Knight' }
];

export const ThemeSelector = () => {
    // 2. Получаем текущую тему и функцию для ее изменения из хранилища
    const { theme: selectedTheme, setTheme: onSelectTheme } = useThemeStore();

    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const currentTheme = themeOptions.find(theme => theme.key === selectedTheme) || themeOptions[0];
    const toggleOpen = () => setIsOpen(!isOpen);

    const selectTheme = (key: 'kz' | 'ru' | 'en') => {
        onSelectTheme(key); // Вызываем функцию из хранилища
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