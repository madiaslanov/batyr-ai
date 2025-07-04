import  { useState, useRef, useEffect } from 'react';
import styles from './customselect.module.css'; // Нужны

type Option = {
    value: string;
    label: string;
};

type CustomSelectProps = {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

const CustomSelect = ({ options, value, onChange, disabled }: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(option => option.value === value);

    const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOptionClick = (newValue: string) => {
        onChange(newValue);
        setIsOpen(false);
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <button
                className={`${styles.selectTrigger} ${disabled ? styles.disabled : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                {selectedOption?.label || 'Выберите...'}
                <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}></span>
            </button>
            {isOpen && (
                <div className={styles.optionsContainer}>
                    {options.map(option => (
                        <div
                            key={option.value}
                            className={styles.option}
                            onClick={() => handleOptionClick(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;