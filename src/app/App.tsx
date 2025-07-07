// src/App.tsx

import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactGA from "react-ga4";
import SwipeRouter from "../features/swiper/swiper.tsx";
import Layout from "../features/layout/layout.tsx";

const TRACKING_ID = "G-2J5SZSQH87";

// Описываем интерфейс WebApp для TypeScript
declare global {
    interface Window {
        Telegram: {
            WebApp: {
                ready: () => void;
                expand: () => void;
                enableClosingConfirmation: () => void;
                setBackgroundColor: (color: string) => void;
                setHeaderColor: (color: 'bg_color' | 'secondary_bg_color' | string) => void; // Уточняем тип
                isHeaderVisible: boolean;
                initDataUnsafe?: {
                    start_param?: string;
                };
            };
        };
    }
    // Добавляем интерфейс для Screen Orientation API
    interface ScreenOrientation {
        lock(orientation: 'portrait-primary'): Promise<void>;
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
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;

            tg.ready();
            tg.expand();
            tg.enableClosingConfirmation();

            // Устанавливаем цвет фона приложения
            tg.setBackgroundColor('#f4f1e9');

            // ✅ ИЗМЕНЕНИЕ 1: Делаем шапку "невидимой"
            // Мы устанавливаем цвет шапки в 'secondary_bg_color'.
            // Это специальное значение, которое заставляет шапку принять цвет фона,
            // эффективно скрывая ее и создавая эффект полного экрана.
            tg.setHeaderColor('secondary_bg_color');
            console.log("🎨 Header color set to secondary_bg_color for fullscreen effect.");

            // ✅ ИЗМЕНЕНИЕ 2: Блокируем поворот экрана
            // Используем стандартный Web API для блокировки ориентации в портретном режиме.
            try {
                if (screen.orientation && typeof screen.orientation.lock === 'function') {
                    screen.orientation.lock('portrait-primary')
                        .then(() => console.log("🔒 Screen orientation locked to portrait."))
                        .catch(err => console.error("Could not lock orientation: ", err));
                }
            } catch (error) {
                console.error("Screen orientation lock API not supported or failed:", error);
            }

            // Обработка deeplink-параметров (start_param)
            const startParam = tg.initDataUnsafe?.start_param;
            if (startParam) {
                console.log(`Deep link parameter detected: ${startParam}`);
                if (startParam === 'generatePhoto') {
                    navigate('/generatePhoto', { replace: true });
                } else if (startParam === 'mapOfBatyrs') {
                    navigate('/mapOfBatyrs', { replace: true });
                }
            }
        }
    }, [navigate]);

    if (isMobile === null) {
        return null;
    }

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

    // Основная маршрутизация приложения
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<SwipeRouter />} />
                <Route path="generatePhoto" element={<SwipeRouter />} />
                <Route path="mapOfBatyrs" element={<SwipeRouter />} />
            </Route>
        </Routes>
    );
}

export default App;