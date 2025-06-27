import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import style from "./layout.module.css";

export default function Layout() {
    const location = useLocation();
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        const threshold = 100;

        const handleResize = () => {
            const viewport = window.visualViewport;
            if (!viewport) return;

            const isOpen = window.innerHeight - viewport.height > threshold;
            setIsKeyboardOpen(isOpen);
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", handleResize);
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener("resize", handleResize);
            }
        };
    }, []);

    return (
        <div className={style.appContainer}>
            <div className={style.mainContent}>
                <Outlet />
            </div>

            {!isKeyboardOpen && (
                <nav className="bottom-nav">
                    <Link to="/generatePhoto">
                        <div className={`${style.card} ${location.pathname === "/generatePhoto" ? style.active : ""}`}>
                            <img src="/navBar_img/photo.png" alt="" />
                            <p>Photo</p>
                        </div>
                    </Link>
                    <Link to="/">
                        <div className={`${style.card} ${location.pathname === "/" ? style.active : ""}`}>
                            <img src="/navBar_img/batyr.png" alt="" />
                            <p>Batyr</p>
                        </div>
                    </Link>
                    <Link to="/generateComics">
                        <div className={`${style.card} ${location.pathname === "/generateComics" ? style.active : ""}`}>
                            <img src="/navBar_img/random.png" alt="" />
                            <p>Comics</p>
                        </div>
                    </Link>
                </nav>
            )}
        </div>
    );
}
