// src/features/layout/layout.tsx

import { Link, Outlet, useLocation } from "react-router-dom";
import style from "./layout.module.css";

export default function Layout() {
    const location = useLocation();

    return (
        <div className={style.appContainer}>
            <div className={style.mainContent}>
                <Outlet />
            </div>
            {/* Порядок ссылок теперь соответствует порядку слайдов: Photo | Batyr | Map */}
            <nav>
                <Link to="/generatePhoto">
                    <div className={`${style.card} ${location.pathname === "/generatePhoto" ? style.active : ""}`}>
                        <img src="/navBar_img/photo.png" alt="Photo" />
                        <p>Фото</p>
                    </div>
                </Link>
                <Link to="/">
                    <div className={`${style.card} ${location.pathname === "/" ? style.active : ""}`}>
                        <img src="/navBar_img/batyr.png" alt="Batyr" />
                        <p>Батыр</p>
                    </div>
                </Link>
                <Link to="/mapOfBatyrs">
                    <div className={`${style.card} ${location.pathname === "/mapOfBatyrs" ? style.active : ""}`}>
                        <img src="/navBar_img/map2.png" alt="Comics" />
                        {/* Кстати, текст можно поменять на Map или Karta :) */}
                        <p>Карта</p>
                    </div>
                </Link>
            </nav>
        </div>
    );
}