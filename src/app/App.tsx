import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactGA from "react-ga4";
import SwipeRouter from "../features/swiper/swiper.tsx";
import Layout from "../features/layout/layout.tsx";

const TRACKING_ID = "G-2J5SZSQH87";

// ✅ ОБНОВЛЕНО: Добавляем больше типов для WebApp для полного контроля
declare global {
    interface Window {
        Telegram: {
            WebApp: {
                ready: () => void;
                expand: () => void;
                enableClosingConfirmation: () => void;
                setBackgroundColor: (color: string) => void;
                setHeaderColor: (color: string) => void;
                MainButton: {
                    isVisible: boolean;
                    show: () => void;
                    hide: () => void;
                    setText: (text: string) => void;
                };
                onEvent: (eventType: 'viewportChanged', callback: (isStable: boolean) => void) => void;
                offEvent: (eventType: 'viewportChanged', callback: (isStable: boolean) => void) => void;
                initDataUnsafe?: {
                    start_param?: string;
                };
            };
        };
    }
}

function App() {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Инициализация Google Analytics (без изменений)
    useEffect(() => {
        ReactGA.initialize(TRACKING_ID);
    }, []);

    // 2. Отправка просмотров страниц (без изменений)
    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }, [location]);

    // 3. Проверка устройства (без изменений)
    useEffect(() => {
        const checkIsMobile = () => /Mobi|Android|iPhone/i.test(navigator.userAgent);
        setIsMobile(checkIsMobile());
    }, []);

    // 4. ✅ ОБНОВЛЕННЫЙ useEffect для Telegram для полного погружения
    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;

            // Сообщаем, что готовы, и сразу разворачиваем окно
            tg.ready();
            tg.expand();

            // Настраиваем цвета для бесшовной интеграции
            tg.setBackgroundColor('#f4f1e9'); // Цвет фона, как у вашей карты
            tg.setHeaderColor('#3a2d21');    // Темно-коричневый для шапки

            // Включаем подтверждение закрытия, чтобы предотвратить случайное закрытие
            tg.enableClosingConfirmation();

            // "Хак" для скрытия нижней панели Telegram:
            // Мы на короткое время показываем, а затем прячем MainButton.
            // Это заставляет Telegram скрыть свою стандартную нижнюю панель.
            if (!tg.MainButton.isVisible) {
                tg.MainButton.setText(' '); // Устанавливаем пустой текст
                tg.MainButton.show();
                setTimeout(() => tg.MainButton.hide(), 50);
            }

            // Обработка deeplink-параметров (без изменений)
            const startParam = tg.initDataUnsafe?.start_param;
            if (startParam) {
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