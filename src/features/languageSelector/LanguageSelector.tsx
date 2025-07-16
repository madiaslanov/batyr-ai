// src/components/common/LanguageSelector.tsx

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSelector.module.css';

// Импортируй иконки или используй текст
import KzFlag from '../../assets/flags/kz.svg'; // Предполагаем, что у тебя есть иконки флагов
import RuFlag from '../../assets/flags/ru.svg';
import EnFlag from '../../assets/flags/en.svg';

const languageOptions = [
    { code: 'kz', label: 'KZ', Icon: KzFlag },
    { code: 'ru', label: 'RU', Icon: RuFlag },
    { code: 'en', label: 'EN', Icon: EnFlag },
];

export function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const currentLanguage = languageOptions.find(lang => lang.code === i18n.language) || languageOptions[0];

    const toggleOpen = () => setIsOpen(!isOpen);

    const selectLanguage = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    // Закрытие по клику вне компонента
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
            <button className={styles.trigger} onClick={toggleOpen}>
                <img src={currentLanguage.Icon} alt={currentLanguage.label} className={styles.flagIcon} />
                <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    {languageOptions.map(option => (
                        <div
                            key={option.code}
                            className={`${styles.option} ${i18n.language === option.code ? styles.selected : ''}`}
                            onClick={() => selectLanguage(option.code)}
                        >
                            <img src={option.Icon} alt={option.label} className={styles.flagIcon} />
                            <span>{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}