// src/pages/MapPage/MapPage.tsx - ЭТОТ КОД УЖЕ ПРАВИЛЬНЫЙ

import { useState } from 'react';
import styles from './MapPage.module.css';
import {ThemeSelector} from "../../../service/themeSelector/themeSelector.tsx";
import {LanguageSelector} from "../../../features/languageSelector/LanguageSelector.tsx";
import MapOfBatyrs from "../mapOfBatyrs.tsx";

export const MapPage = () => {
    const [currentTheme, setCurrentTheme] = useState<'kz' | 'ru' | 'en'>('kz');

    return (
        <div className={styles.pageContainer}>
            <div className={styles.controls}>
                <ThemeSelector
                    selectedTheme={currentTheme}
                    onSelectTheme={setCurrentTheme}
                />
                <LanguageSelector />
            </div>

            {/* Все правильно, передаем тему как prop */}
            <MapOfBatyrs theme={currentTheme} />
        </div>
    );
};