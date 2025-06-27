import './App.css'
import { Route, Routes, useNavigate } from "react-router-dom";
import Layout from "../features/layout/layout.tsx";
import Batyr from "../components/batyr/batyr.tsx";
import GenerateComics from "../components/generateComics/generateComics.tsx";
import Photo from "../components/photo/photo.tsx";
import { useEffect, useState } from "react";

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
            tg.setBackgroundColor("#ffffff");

            const param = tg.initDataUnsafe?.start_param;
            if (param === "generatePhoto") navigate("/generatePhoto");
            if (param === "generateComics") navigate("/generateComics");
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
                <h2>📱 Открой с мобильного устройства</h2>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Batyr />} />
                    <Route path="generateComics" element={<GenerateComics />} />
                    <Route path="generatePhoto" element={<Photo />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App;
