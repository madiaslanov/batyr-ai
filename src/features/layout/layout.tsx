import {Link, Outlet, useLocation} from "react-router-dom";
import {useEffect} from "react";
import style from "./layout.module.css";

export default function Layout() {
    const location = useLocation();

    useEffect(() => {
        const onFocus = () => document.body.classList.add("keyboard-open");
        const onBlur = () => document.body.classList.remove("keyboard-open");

        window.addEventListener("focusin", onFocus);
        window.addEventListener("focusout", onBlur);

        return () => {
            window.removeEventListener("focusin", onFocus);
            window.removeEventListener("focusout", onBlur);
        };
    }, []);

    return (
        <div className={style.appContainer}>
            <div className={style.mainContent}>
                <Outlet />
            </div>
            <nav className="bottom-nav">
                <Link to="/generatePhoto">
                    <div className={`${style.card} ${location.pathname === "/generatePhoto" ? style.active : ""}`}>
                        <img src="/navBar_img/photo.png" alt=""/>
                        <p>Photo</p>
                    </div>
                </Link>
                <Link to="/">
                    <div className={`${style.card} ${location.pathname === "/" ? style.active : ""}`}>
                        <img src="/navBar_img/batyr.png" alt=""/>
                        <p>Batyr</p>
                    </div>
                </Link>
                <Link to="/generateComics">
                    <div className={`${style.card} ${location.pathname === "/generateComics" ? style.active : ""}`}>
                        <img src="/navBar_img/random.png" alt=""/>
                        <p>Comics</p>
                    </div>
                </Link>
            </nav>
        </div>
    );
}