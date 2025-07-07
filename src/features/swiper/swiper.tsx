// src/features/swiper/SwipeRouter.tsx

import { Swiper, SwiperSlide } from 'swiper/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import SwiperCore from 'swiper';

// Стили Swiper
import 'swiper/css';

// Ваши компоненты страниц
import { BatyrContainer } from "../../components/batyr/batyrContainer.tsx";
import PhotoContainer from "../../components/photo/photoContainer.tsx";
import MapOfBatyrs from "../../components/mapOfBatyrs/mapOfBatyrs.tsx";

// Единственный источник правды о порядке страниц
const pages = ['/generatePhoto', '/', '/mapOfBatyrs'];

export default function SwipeRouter() {
    const location = useLocation();
    const navigate = useNavigate();
    const swiperRef = useRef<SwiperCore | null>(null);
    const isNavigatingRef = useRef(false);

    // Определяем активный индекс СТРОГО по URL
    const activeIndex = pages.indexOf(location.pathname);

    // Эффект для синхронизации: URL изменился -> Swiper должен среагировать
    useEffect(() => {
        // Убедимся, что swiper существует
        if (!swiperRef.current) return;

        // ✅ ГЛАВНОЕ ИСПРАВЛЕНИЕ:
        // Принудительно обновляем состояние Swiper.
        // Это заставляет его перечитать пропсы (allowSlidePrev/Next)
        // и правильно разрешить или запретить свайпы ПОСЛЕ клика на навбаре.
        swiperRef.current.update();

        // Программно переходим на слайд, если URL и слайдер не синхронизированы
        if (swiperRef.current.activeIndex !== activeIndex && activeIndex > -1) {
            isNavigatingRef.current = true;
            swiperRef.current.slideTo(activeIndex, 300);
        }
    }, [activeIndex]); // Этот useEffect зависит ТОЛЬКО от activeIndex

    // Функция для синхронизации: Пользователь свайпнул -> URL должен измениться
    const handleSlideChange = (swiper: SwiperCore) => {
        if (isNavigatingRef.current) {
            isNavigatingRef.current = false;
            return;
        }
        const newPath = pages[swiper.activeIndex];
        if (location.pathname !== newPath) {
            navigate(newPath);
        }
    };

    if (activeIndex === -1) {
        return null;
    }

    return (
        <Swiper
            // --- Инициализация и синхронизация ---
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            initialSlide={activeIndex}
            onSlideChangeTransitionEnd={handleSlideChange}
            style={{ height: '100%', width: '100%' }}

            // --- Динамическое управление свайпами ---
            // Эти пропсы корректно перерисовываются React,
            // а swiper.update() заставляет Swiper их применить.
            allowSlidePrev={activeIndex > 0}
            allowSlideNext={activeIndex < pages.length - 1}
            resistanceRatio={0}
        >
            {/* Порядок слайдов должен СТРОГО соответствовать порядку в массиве `pages` */}
            <SwiperSlide>
                <PhotoContainer />
            </SwiperSlide>
            <SwiperSlide>
                <BatyrContainer />
            </SwiperSlide>
            <SwiperSlide>
                <MapOfBatyrs />
            </SwiperSlide>
        </Swiper>
    );
}