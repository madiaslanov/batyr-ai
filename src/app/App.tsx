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

    // Google Analytics и проверка на мобильное устройство остаются без изменений
    useEffect(() => { ReactGA.initialize(TRACKING_ID); }, []);
    useEffect(() => { ReactGA.send({ hitType: "pageview", page: location.pathname + location.search }); }, [location]);
    useEffect(() => {
        const checkIsMobile = () => /Mobi|Android|iPhone/i.test(navigator.userAgent);
        setIsMobile(checkIsMobile());
    }, []);

    // ===== ГЛАВНЫЙ И ЕДИНСТВЕННЫЙ ХУК ИНИЦИАЛИЗАЦИИ =====
    useEffect(() => {
        // Функция, которая будет пытаться инициализировать приложение
        const tryInit = () => {
            const tg = window.Telegram?.WebApp;

            // Если объекта tg еще нет, или он не готов, выходим и ждем следующей попытки
            if (!tg || !tg.isReady) {
                return;
            }

            // Если мы здесь, значит tg готов. Останавливаем интервал.
            clearInterval(initInterval);

            // --- ВЫПОЛНЯЕМ ВСЕ ДЕЙСТВИЯ ОДИН РАЗ ---

            // 1. Разворачиваем на полный экран
            tg.expand();

            // 2. Настраиваем цвета и поведение
            tg.enableClosingConfirmation();
            tg.setBackgroundColor('#1a0f3d');
            tg.setHeaderColor('#1a0f3d');

            // 3. Настраиваем кнопку "Назад"
            tg.BackButton.onClick(() => navigate(-1));

            // 4. Обработка deep-link
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

        // Запускаем tg.ready() как можно раньше.
        // Это асинхронный процесс, и мы будем проверять его готовность.
        window.Telegram?.WebApp?.ready();

        // Создаем интервал, который будет вызывать tryInit каждые 100мс
        const initInterval = setInterval(tryInit, 100);

        // Очищаем интервал при размонтировании компонента, чтобы избежать утечек
        return () => {
            clearInterval(initInterval);
        };
    }, [navigate]); // Зависимость только от navigate

    // Обновляем видимость кнопки "Назад" при смене роута
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

    if (isMobile === null) {
        return null;
    }

    if (!isMobile) {
        // Эта логика остается, она корректна
        const splash = document.getElementById('splash-screen');
        if (splash) splash.remove();
        return (
            <div style={{ background: '#1a0f3d', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
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