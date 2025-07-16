// Полностью замените содержимое файла: src/App.tsx

import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactGA from "react-ga4";
import Layout from "../features/layout/layout.tsx";

const TRACKING_ID = "G-2J5SZSQH87";

declare global {
    interface Window {
        Telegram: any;
    }
}

function App() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Состояние для проверки, мобильное ли это устройство
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    // --- Google Analytics ---
    useEffect(() => {
        ReactGA.initialize(TRACKING_ID);
    }, []);

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }, [location]);

    // --- Проверка на мобильное устройство ---
    useEffect(() => {
        const checkIsMobile = () => /Mobi|Android|iPhone/i.test(navigator.userAgent);
        setIsMobile(checkIsMobile());
    }, []);

    // --- ОСНОВНАЯ ЛОГИКА ИНИЦИАЛИЗАЦИИ ---
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg) {
            // 1. Говорим Telegram, что приложение готово
            tg.ready();

            // 2. Разворачиваем на полный экран
            tg.expand();

            // 3. Включаем подтверждение при закрытии
            tg.enableClosingConfirmation();

            // 4. Настраиваем цвета (можно убрать, если цвета из CSS)
            tg.setBackgroundColor('#1a0f3d'); // Цвет фона должен совпадать со сплэш-скрином
            tg.setHeaderColor('#1a0f3d');

            // 5. Настраиваем кнопку "Назад"
            if (tg.BackButton.isVisible) {
                tg.BackButton.hide(); // Сначала скроем, чтобы избежать моргания
            }
            // Показываем кнопку назад, только если мы не на главной странице
            if (location.pathname !== '/') {
                tg.BackButton.show();
            }
            // Навешиваем обработчик. ВАЖНО: его нужно вешать один раз!
            const handleBackClick = () => {
                navigate(-1); // Простое действие "назад"
            };
            tg.onEvent('backButtonClicked', handleBackClick);

            // 6. Обработка deep-link
            const startParam = tg.initDataUnsafe?.start_param;
            if (startParam) {
                if (startParam === 'generatePhoto') navigate('/generatePhoto', { replace: true });
                else if (startParam === 'mapOfBatyrs') navigate('/mapOfBatyrs', { replace: true });
            }

            // 7. Скрываем сплэш-скрин после всех настроек
            const splash = document.getElementById('splash-screen');
            const root = document.getElementById('root');
            if (splash && root) {
                root.style.display = 'flex'; // Показываем основной контейнер
                splash.classList.add('hidden'); // Добавляем класс для анимации скрытия
                setTimeout(() => {
                    splash.remove(); // Удаляем из DOM после анимации
                }, 600);
            }

            // Очистка обработчика при размонтировании компонента
            return () => {
                tg.offEvent('backButtonClicked', handleBackClick);
            }
        }
    }, [navigate]); // Зависимость только от navigate, чтобы не пересоздавать обработчики

    // --- Обновление видимости кнопки "Назад" при смене роута ---
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg) {
            if (location.pathname !== '/' && !tg.BackButton.isVisible) {
                tg.BackButton.show();
            } else if (location.pathname === '/' && tg.BackButton.isVisible) {
                tg.BackButton.hide();
            }
        }
    }, [location.pathname]);


    // Если проверка на мобильное устройство еще не завершилась, ничего не показываем
    if (isMobile === null) {
        // В этот момент пользователь видит сплэш-скрин
        return null;
    }

    // Если это не мобильное устройство, показываем заглушку
    if (!isMobile) {
        // Убираем сплэш-скрин и показываем сообщение
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

    return (
        <Routes>
            <Route path="/*" element={<Layout />} />
        </Routes>
    );
}

export default App;