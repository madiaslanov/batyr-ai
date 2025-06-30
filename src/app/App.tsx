import {Route, Routes, useNavigate} from "react-router-dom";
import Layout from "../features/layout/layout";
import {useEffect, useState} from "react";
import SwipeRouter from "../features/swiper/swiper.tsx";

declare global {
    interface Window {
        Telegram: any;
    }
}

function App() {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkIsMobile = () => {
            const isMobileUA = /Mobi|Android|iPhone/i.test(navigator.userAgent);
            const isSmallScreen = window.innerWidth < 768;
            return isMobileUA && isSmallScreen;
        };
        setIsMobile(checkIsMobile());
    }, []);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            tg.expand();
            tg.setBackgroundColor('#ffffff');

            const startParam = tg.initDataUnsafe?.start_param;
            if (startParam === 'generatePhoto') {
                navigate('/generatePhoto');
            } else if (startParam === 'generateComics') {
                navigate('/generateComics');
            }
        }
    }, [navigate]);



    if (isMobile === null) return null;

    if (!isMobile) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '1rem'
            }}>
                <div>
                    <h2>⚠️ Сайт доступен только на мобильных устройствах</h2>
                    <p>Пожалуйста, откройте сайт на телефоне 📱</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<SwipeRouter key="batyr" />} />
                <Route path="generatePhoto" element={<SwipeRouter key="photo" />} />
                <Route path="generateComics" element={<SwipeRouter key="comics" />} />
            </Route>
        </Routes>
    );
}

export default App;
