import {Link, Outlet, useLocation} from "react-router-dom";
import style from "./layout.module.css"

export default function Layout() {
    const location = useLocation()

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
                        <img src="/navBar_img/cubs.png" alt=""/>
                        <p>
                            Comics
                        </p>
                    </div>
                </Link>
            </nav>


        </div>
    )
}