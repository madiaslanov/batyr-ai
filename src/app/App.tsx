import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactGA from "react-ga4";
import SwipeRouter from "../features/swiper/swiper.tsx";
import Layout from "../features/layout/layout.tsx";

const TRACKING_ID = "G-2J5SZSQH87";

// ✅ ОБНОВЛЕНО: Описываем интерфейс WebApp для TypeScript
declare global {
    interface Window {
        Telegram: {
            WebApp: {
                ready: () => void;
                expand: () => void;
                enableClosingConfirmation: () => void;
                setBackgroundColor: (color: string) => void;
                setHeaderColor: (color: string) => void;
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
        // Проверяем, что объект Telegram.WebApp существует
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;

            // Сообщаем Telegram, что приложение готово к отображению
            tg.ready();

            // ✅ ГЛАВНОЕ ИЗМЕНЕНИЕ: Растягиваем окно на весь экран
            tg.expand();
            console.log("🚀 Telegram Web App expanded to full screen.");

            // ✅ РЕКОМЕНДАЦИЯ: Включаем подтверждение закрытия для лучшего UX
            tg.enableClosingConfirmation();

            // Устанавливаем цвета, чтобы приложение выглядело как часть Telegram
            tg.setBackgroundColor('#f4f1e9'); // Цвет фона, как у вашей карты
            tg.setHeaderColor('#3a2d21');    // Темно-коричневый для шапки

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
    }, [navigate]); // navigate в зависимостях, так как используется внутри

    // Пока идет проверка на мобильное устройство, ничего не рендерим
    if (isMobile === null) {
        return null;
    }

    // Если не мобильное устройство, показываем заглушку
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