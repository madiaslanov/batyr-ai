// Полностью замените содержимое файла: src/App.tsx

import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactGA from "react-ga4";
import Layout from "../features/layout/layout.tsx";

const TRACKING_ID = "G-2J5SZSQH87";

function App() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    // Аналитика и проверка на мобильное устройство
    useEffect(() => { ReactGA.initialize(TRACKING_ID); }, []);
    useEffect(() => { ReactGA.send({ hitType: "pageview", page: location.pathname + location.search }); }, [location]);
    useEffect(() => {
        const checkIsMobile = () => /Mobi|Android|iPhone/i.test(navigator.userAgent);
        setIsMobile(checkIsMobile());
    }, []);

    // Главный хук инициализации
    useEffect(() => {
        const tryInit = () => {
            const tg = window.Telegram?.WebApp;
            if (!tg || !tg.isReady) return;

            clearInterval(initInterval);

            // --- ОСНОВНЫЕ ДЕЙСТВИЯ ---

            // 1. Блокируем ориентацию экрана (будет работать там, где поддерживается)
            try {
                if (screen.orientation && typeof screen.orientation.lock === 'function') {
                    screen.orientation.lock('portrait-primary').catch(() => {});
                }
            } catch (error) {}

            // 2. Разворачиваем приложение.
            tg.expand();

            // 3. Убираем ручную установку цветов. Приложение будет использовать CSS-переменные от Telegram.

            // 4. Остальные настройки
            tg.enableClosingConfirmation();
            tg.BackButton.onClick(() => navigate(-1));

            // Обработка deep-link
            if (tg.initDataUnsafe?.start_param) {
                const startParam = tg.initDataUnsafe.start_param;
                if (startParam === 'generatePhoto') navigate('/generatePhoto', { replace: true });
                else if (startParam === 'mapOfBatyrs') navigate('/mapOfBatyrs', { replace: true });
            }

            // 5. Убираем сплэш-скрин
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.classList.add('hidden');
                setTimeout(() => splash.remove(), 600);
            }
        };

        window.Telegram?.WebApp?.ready();
        const initInterval = setInterval(tryInit, 100);

        return () => {
            clearInterval(initInterval);
        };
    }, [navigate]);

    // Обновляем видимость кнопки "Назад"
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg) {
            if (location.pathname !== '/') {
                tg.BackButton.show();
            } else {
                tg.BackButton.hide();
            }
        }
    }, [location.pathname]);

    // Отображение компонентов
    if (isMobile === null) return null;

    if (!isMobile) {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.remove();
        return (
            <div style={{ background: 'var(--tg-theme-bg-color, #1a0f3d)', color: 'var(--tg-theme-text-color, #ffffff)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
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