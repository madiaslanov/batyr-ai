// src/features/themeSelector/themeSelector.tsx

import { useState, useEffect, useRef } from 'react';
import styles from './themeSelector.module.css'; // Будем использовать новые стили

const themeOptions = [
    { key: 'kz', name: 'Батыр' },
    { key: 'ru', name: 'Богатырь' },
    { key: 'en', name: 'Knight' }
];

interface ThemeSelectorProps {
    selectedTheme: string;
    onSelectTheme: (theme: string) => void;
}

export const ThemeSelector = ({ selectedTheme, onSelectTheme }: ThemeSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Находим текущую выбранную тему, чтобы показать ее имя на кнопке
    const currentTheme = themeOptions.find(theme => theme.key === selectedTheme) || themeOptions[0];

    const toggleOpen = () => setIsOpen(!isOpen);

    const selectTheme = (key: string) => {
        onSelectTheme(key); // Вызываем функцию из props для смены темы
        setIsOpen(false);   // Закрываем выпадающий список
    };

    // Хук для закрытия списка по клику вне его области (точно как в LanguageSelector)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            {/* Кнопка, которая открывает/закрывает список */}
            <button className={styles.trigger} onClick={toggleOpen}>
                <span>{currentTheme.name}</span>
                <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Сам выпадающий список, который показывается по условию */}
            {isOpen && (
                <div className={styles.dropdown}>
                    {themeOptions.map(option => (
                        <div
                            key={option.key}
                            // Применяем класс 'selected', если опция выбрана
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