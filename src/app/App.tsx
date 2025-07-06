// src/App.tsx (ИСПРАВЛЕННАЯ ВЕРСИЯ)

import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactGA from "react-ga4";
import SwipeRouter from "../features/swiper/swiper.tsx";
import Layout from "../features/layout/layout.tsx";

const TRACKING_ID = "G-2J5SZSQH87";

declare global {
    interface Window {
        Telegram: any;
    }
}

function App() {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Инициализация Google Analytics
    useEffect(() => {
        ReactGA.initialize(TRACKING_ID);
    }, []);

    // 2. Отправка просмотров страниц
    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }, [location]);

    // 3. Проверка устройства
    useEffect(() => {
        const checkIsMobile = () => /Mobi|Android|iPhone/i.test(navigator.userAgent);
        setIsMobile(checkIsMobile());
    }, []);

    // 4. Работа с Telegram WebApp
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            tg.expand();
            tg.setBackgroundColor('#f4f1e9'); // Установим цвет фона, как у карты

            const startParam = tg.initDataUnsafe?.start_param;
            if (startParam === 'generatePhoto') {
                navigate('/generatePhoto');
            } else if (startParam === 'mapOfBatyrs') {
                navigate('/mapOfBatyrs');
            }
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

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                {/* 
                  ✅ ИСПРАВЛЕНО:
                  Убраны все `key`, чтобы обеспечить один постоянный экземпляр SwipeRouter.
                  Теперь он будет плавно реагировать на смену URL, а не пересоздаваться.
                */}
                <Route index element={<SwipeRouter />} />
                <Route path="generatePhoto" element={<SwipeRouter />} />
                <Route path="mapOfBatyrs" element={<SwipeRouter />} />
            </Route>
        </Routes>
    );
}

export default App;