// Полностью скопируй в файл: src/i18n.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationRU from './locales/ru/translation.json';
import translationEN from './locales/en/translation.json';
import translationKZ from './locales/kz/translation.json';

const resources = {
    en: { translation: translationEN },
    ru: { translation: translationRU },
    kz: { translation: translationKZ }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'ru',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['queryString', 'localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;