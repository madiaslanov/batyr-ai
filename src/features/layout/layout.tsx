import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import style from "./layout.module.css";

export default function Layout() {
    const location = useLocation();
    const [keyboardOpen, setKeyboardOpen] = useState(false);

    useEffect(() => {
        const visualViewport = window.visualViewport;

        if (!visualViewport) return;

        const handleResize = () => {
            const height = visualViewport.height;
            const windowHeight = window.innerHeight;

            if (typeof height !== "number") return;

            const heightDiff = windowHeight - height;
            setKeyboardOpen(heightDiff > 150); // клавиатура точно
        };

        visualViewport.addEventListener("resize", handleResize);
        visualViewport.addEventListener("scroll", handleResize);

        handleResize();

        return () => {
            visualViewport.removeEventListener("resize", handleResize);
            visualViewport.removeEventListener("scroll", handleResize);
        };
    }, []);

    return (
        <div className={style.appContainer}>
            <div className={style.mainContent}>
                <Outlet />
            </div>
            {!keyboardOpen && (
                <nav>
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
