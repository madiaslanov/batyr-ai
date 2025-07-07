// src/features/layout/layout.tsx (ОКОНЧАТЕЛЬНОЕ, ПРОВЕРЕННОЕ РЕШЕНИЕ)

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

    const swiperRef = useRef<SwiperCore | null>(null);
    const isNavigatingByClick = useRef(false);

    // Этот useEffect отвечает ТОЛЬКО за запуск программного свайпа
    useEffect(() => {
        if (swiperRef.current && swiperRef.current.activeIndex !== activeIndex && activeIndex > -1) {
            isNavigatingByClick.current = true;
            swiperRef.current.slideTo(activeIndex, 300);
        }
    }, [activeIndex]);

    // Эта функция - ЕДИНЫЙ ЦЕНТР УПРАВЛЕНИЯ для ВСЕХ изменений слайдера
    const handleSlideChange = (swiper: SwiperCore) => {
        // ✅ ШАГ 1: Обновляем правила свайпа ПОСЛЕ каждого изменения
        // Это гарантирует, что правила всегда соответствуют текущему слайду.
        swiper.params.allowSlidePrev = swiper.activeIndex > 0;
        swiper.params.allowSlideNext = swiper.activeIndex < pages.length - 1;
        swiper.update(); // Применяем новые правила немедленно

        // ШАГ 2: Разбираемся, был ли это клик или свайп пользователя
        if (isNavigatingByClick.current) {
            isNavigatingByClick.current = false; // Сбрасываем флаг и выходим
            return;
        }

        // ШАГ 3: Если это был свайп пользователя, меняем URL
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
                    onSwiper={(swiper) => { swiperRef.current = swiper; }}
                    initialSlide={activeIndex}
                    onSlideChange={handleSlideChange}
                    style={{ height: '100%', width: '100%' }}
                    resistanceRatio={0}
                    // ✅✅✅ ГЛАВНОЕ ИЗМЕНЕНИЕ ✅✅✅
                    // Мы УДАЛИЛИ пропсы allowSlidePrev и allowSlideNext из JSX.
                    // Теперь мы управляем ими напрямую, что исключает конфликты.
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