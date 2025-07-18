// src/pages/MapPage/MapPage.tsx

import styles from './MapPage.module.css';
import { ThemeSelector } from "../../../service/themeSelector/themeSelector.tsx";
import { LanguageSelector } from "../../../features/languageSelector/LanguageSelector.tsx";
import MapOfBatyrs from "../mapOfBatyrs.tsx";

// 🔄 УДАЛЯЕМ useState, ТАК КАК СОСТОЯНИЕ ТЕПЕРЬ ГЛОБАЛЬНОЕ
export const MapPage = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.controls}>
                {/* 🔄 ThemeSelector теперь не требует props, он сам знает о состоянии */}
                <ThemeSelector />
                <LanguageSelector />
            </div>

            {/* 🔄 MapOfBatyrs тоже не требует props, он сам возьмет тему из хранилища */}
            <MapOfBatyrs />
        </div>
    );
};