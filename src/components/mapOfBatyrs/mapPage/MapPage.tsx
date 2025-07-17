// src/pages/MapPage/MapPage.tsx

import { useState } from 'react';
import styles from './MapPage.module.css';
import {ThemeSelector} from "../../../service/themeSelector/themeSelector.tsx";
import {LanguageSelector} from "../../../features/languageSelector/LanguageSelector.tsx";
import MapOfBatyrs from "../mapOfBatyrs.tsx";
// Укажите правильный путь

export const MapPage = () => {
    const [currentTheme, setCurrentTheme] = useState('kz');

    return (
        <div className={styles.pageContainer}>
            <div className={styles.controls}>
                {/* Управляемый селектор темы */}
                <ThemeSelector
                    selectedTheme={currentTheme}
                    onSelectTheme={setCurrentTheme}
                />
                {/* Независимый селектор языка */}
                <LanguageSelector />
            </div>

            {/* Передаем тему в компонент карты как prop */}
            <MapOfBatyrs theme={currentTheme} />
        </div>
    );
};