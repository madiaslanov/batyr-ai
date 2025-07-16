// Полностью замените содержимое файла: src/App.tsx

import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import ReactGA from "react-ga4";
import Layout from "../features/layout/layout.tsx";

const TRACKING_ID = "G-2J5SZSQH87";

// Объявляем глобальный тип для window.Telegram.WebApp, чтобы TypeScript не ругался
declare global {
    interface Window {
        Telegram: {
            WebApp: any;
        };
    }
}

function App() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const isInitialized = useRef(false);

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

            if (!tg || !tg.ready || isInitialized.current) {
                tg?.ready();
                return;
            }

            clearInterval(initInterval);
            isInitialized.current = true;

            // --- ОСНОВНЫЕ ДЕЙСТВИЯ ---

            // 1. Разворачиваем окно на максимальную высоту
            tg.expand();

            // 2. Блокируем ориентацию (сработает там, где поддерживается)
            try {
                if (screen.orientation && typeof screen.orientation.lock === 'function') {
                    screen.orientation.lock('portrait-primary').catch(() => {});
                }
            } catch (e) {}

            // 3. УБИРАЕМ РУЧНУЮ УСТАНОВКУ ЦВЕТОВ.
            // Теперь приложение будет использовать цвета, которые предоставляет клиент Telegram.
            // tg.setHeaderColor(...)
            // tg.setBackgroundColor(...)

            // 4. Прочие настройки
            tg.enableClosingConfirmation();

            // 5. Настройка кнопки "Назад"
            const handleBackClick = () => navigate(-1);
            tg.onEvent('backButtonClicked', handleBackClick);

            // Обработка deep-link
            if (tg.initDataUnsafe?.start_param) {
                const startParam = tg.initDataUnsafe.start_param;
                if (startParam === 'generatePhoto') navigate('/generatePhoto', { replace: true });
                else if (startParam === 'mapOfBatyrs') navigate('/mapOfBatyrs', { replace: true });
            }

            // 6. Убираем сплэш-скрин
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.classList.add('hidden');
                setTimeout(() => splash.remove(), 600);
            }

            return () => {
                tg.offEvent('backButtonClicked', handleBackClick);
            };
        };

        const initInterval = setInterval(tryInit, 50);

        return () => {
            clearInterval(initInterval);
        };
    }, [navigate]);

    // Управление видимостью кнопки "Назад"
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg && tg.isReady) { // Добавлена проверка isReady для надежности
            if (location.pathname !== '/') {
                tg.BackButton.show();
            } else {
                tg.BackButton.hide();
            }
        }
    }, [location.pathname]);

    // ----- Рендеринг -----
    if (isMobile === null) {
        return null;
    }

    if (!isMobile) {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.remove();
        return (
            <div style={{ background: 'var(--tg-theme-secondary-bg-color, #18222d)', color: 'var(--tg-theme-text-color, #ffffff)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
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