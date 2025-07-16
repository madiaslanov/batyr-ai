// Полностью замени содержимое файла: src/App.tsx

import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import ReactGA from "react-ga4";
import Layout from "../features/layout/layout.tsx";

const TRACKING_ID = "G-2J5SZSQH87";

declare global {
    interface Window { Telegram: any; ScreenOrientation: any; }
}

function App() {
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => { ReactGA.initialize(TRACKING_ID); }, []);
    useEffect(() => { ReactGA.send({ hitType: "pageview", page: location.pathname + location.search }); }, [location]);
    useEffect(() => { const checkIsMobile = () => /Mobi|Android|iPhone/i.test(navigator.userAgent); setIsMobile(checkIsMobile()); }, []);
    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            tg.enableClosingConfirmation();
            tg.setBackgroundColor('#f4f1e9');
            tg.setHeaderColor('secondary_bg_color');
            try { if (screen.orientation && typeof screen.orientation.lock === 'function') { screen.orientation.lock('portrait-primary'); } } catch (error) { console.error(error); }
            const startParam = tg.initDataUnsafe?.start_param;
            if (startParam) { if (startParam === 'generatePhoto') { navigate('/generatePhoto', { replace: true }); } else if (startParam === 'mapOfBatyrs') { navigate('/mapOfBatyrs', { replace: true }); } }
        }
    }, [navigate]);

    if (isMobile === null) return null;

    if (!isMobile) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
                <div>
                    <h2>{t('mobileOnly')}</h2>
                    <p>{t('openOnPhone')}</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/*" element={<Layout />} />
        </Routes>
    );
}

export default App;