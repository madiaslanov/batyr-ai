// src/App.tsx (УПРОЩЕННАЯ ВЕРСИЯ)

import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactGA from "react-ga4";
// SwipeRouter больше не нужен здесь
import Layout from "../features/layout/layout.tsx";

const TRACKING_ID = "G-2J5SZSQH87";

// ... (весь ваш код с declare global и т.д. остается без изменений) ...
declare global {
    interface Window {
        Telegram: {
            WebApp: {
                ready: () => void;
                expand: () => void;
                enableClosingConfirmation: () => void;
                setBackgroundColor: (color: string) => void;
                setHeaderColor: (color: 'bg_color' | 'secondary_bg_color' | string) => void;
                isHeaderVisible: boolean;
                initDataUnsafe?: {
                    start_param?: string;
                };
            };
        };
    }
    interface ScreenOrientation {
        lock(orientation: 'portrait-primary'): Promise<void>;
    }
}


function App() {
    // ... (весь ваш код с хуками useState, useNavigate, useEffect остается без изменений) ...
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
                    <h2>⚠️ Қолданба тек мобильді құрылғыларға арналған</h2>
                    <p>Сайтты телефон арқылы ашыңыз 📱</p>
                </div>
            </div>
        );
    }

    // ✅ ГЛАВНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ
    // Теперь у нас один маршрут, который всегда рендерит Layout.
    // Layout сам разберется, какую страницу показывать.
    return (
        <Routes>
            <Route path="/*" element={<Layout />} />
        </Routes>
    );
}

export default App;