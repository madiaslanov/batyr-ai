// src/features/layout/layout.tsx (ОКОНЧАТЕЛЬНОЕ РЕШЕНИЕ)

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import 'swiper/css';

import style from "./layout.module.css";
import { BatyrContainer } from "../../components/batyr/batyrContainer.tsx";
import PhotoContainer from "../../components/photo/photoContainer.tsx";
import MapOfBatyrs from "../../components/mapOfBatyrs/mapOfBatyrs.tsx";

const pages = ['/generatePhoto', '/', '/mapOfBatyrs'];

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const activeIndex = pages.indexOf(location.pathname);

    // Этот хук теперь нужен ТОЛЬКО для синхронизации "свайп -> URL"
    const handleSlideChange = (swiper: SwiperCore) => {
        const newPath = pages[swiper.activeIndex];
        if (location.pathname !== newPath) {
            navigate(newPath);
        }
    };

    if (activeIndex === -1) {
        return null;
    }

    return (
        <div className={style.appContainer}>
            <div className={style.mainContent}>
                <Swiper
                    // ✅✅✅ ГЛАВНОЕ ИЗМЕНЕНИЕ ✅✅✅
                    // Этот ключ заставляет React ПОЛНОСТЬЮ уничтожить и заново создать Swiper,
                    // когда меняется activeIndex (т.е. после клика на навбаре).
                    // Swiper каждый раз стартует "с чистого листа" на правильном слайде.
                    key={activeIndex}

                    // Мы больше не используем сложный useEffect.
                    // initialSlide теперь надежно работает на новом экземпляре.
                    initialSlide={activeIndex}
                    onSlideChangeTransitionEnd={handleSlideChange}

                    style={{ height: '100%', width: '100%' }}

                    // Эти пропсы тоже будут правильно установлены при создании нового Swiper
                    allowSlidePrev={activeIndex > 0}
                    allowSlideNext={activeIndex < pages.length - 1}
                    resistanceRatio={0}
                >
                    <SwiperSlide><PhotoContainer /></SwiperSlide>
                    <SwiperSlide><BatyrContainer /></SwiperSlide>
                    <SwiperSlide><MapOfBatyrs /></SwiperSlide>
                </Swiper>
            </div>

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
                        <img src="/navBar_img/map2.png" alt="Map" />
                        <p>Карта</p>
                    </div>
                </Link>
            </nav>
        </div>
    );
}