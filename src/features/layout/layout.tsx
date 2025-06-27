import {Link, Outlet, useLocation} from "react-router-dom";
import style from "./layout.module.css"
import {useEffect} from "react";

export default function Layout() {
    const location = useLocation()

    useEffect(() => {
        const handleFocus = () => document.body.classList.add("keyboard-open");
        const handleBlur = () => document.body.classList.remove("keyboard-open");

        window.addEventListener("focusin", handleFocus);
        window.addEventListener("focusout", handleBlur);

        return () => {
            window.removeEventListener("focusin", handleFocus);
            window.removeEventListener("focusout", handleBlur);
        };
    }, []);

    return (
        <div className={style.appContainer}>
            <div className={style.mainContent}>
                <Outlet/>
            </div>
            <nav>
                <Link to="/generatePhoto" >
                    <div className={`${style.card} ${location.pathname === "/generatePhoto" ? style.active : ""}`}>
                        <img src="/navBar_img/photo.png" alt=""/>
                        <p>
                            Photo
                        </p>
                    </div>
                </Link>
                <Link to="/" >
                    <div className={`${style.card} ${location.pathname === "/" ? style.active : ""}`}>
                        <img src="/navBar_img/batyr.png" alt=""/>
                        <p>
                            Batyr
                        </p>
                    </div>
                </Link>
                <Link to="/generateComics">
                    <div className={`${style.card} ${location.pathname === "/generateComics" ? style.active : ""}`}>
                        <img src="/navBar_img/random.png" alt=""/>
                        <p>
                            Comics
                        </p>
                    </div>
                </Link>
            </nav>


        </div>
    )
}