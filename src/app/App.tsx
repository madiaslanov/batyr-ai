// Полностью замените содержимое файла: src/App.tsx

import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactGA from "react-ga4";
import Layout from "../features/layout/layout.tsx";

const TRACKING_ID = "G-2J5SZSQH87";

// Убираем объявление Window.Telegram, оно больше не нужно в React
// declare global { interface Window { Telegram: any; } }

function App() {
    const { t } = useTranslation();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    // Google Analytics
    useEffect(() => { ReactGA.initialize(TRACKING_ID); }, []);
    useEffect(() => { ReactGA.send({ hitType: "pageview", page: location.pathname + location.search }); }, [location]);

    // Проверка на мобильное устройство
    useEffect(() => {
        const checkIsMobile = () => /Mobi|Android|iPhone/i.test(navigator.userAgent);
        setIsMobile(checkIsMobile());
    }, []);

    // Пока идет проверка, пользователь видит сплэш-скрин из index.html
    if (isMobile === null) {
        return null;
    }

    // Если не мобильное устройство, показываем заглушку
    if (!isMobile) {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.remove();
        return (
            <div style={{ background: '#1a0f3d', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem', fontFamily: 'sans-serif' }}>
                <div>
                    <h2>{t('mobileOnly')}</h2>
                    <p>{t('openOnPhone')}</p>
                </div>
            </div>
        );
    }

    // Если все OK, рендерим приложение
    return (
        <Routes>
            <Route path="/*" element={<Layout />} />
        </Routes>
    );
}

export default App;