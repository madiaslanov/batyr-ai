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
    const isNavigatingRef = useRef(false); // Флаг, чтобы избежать двойных срабатываний

    // Определяем активный индекс СТРОГО по URL
    const activeIndex = pages.indexOf(location.pathname);

    // Эффект для синхронизации: URL изменился -> Swiper должен среагировать
    useEffect(() => {
        if (swiperRef.current && swiperRef.current.activeIndex !== activeIndex) {
            isNavigatingRef.current = true; // Сообщаем, что навигация идет программно
            swiperRef.current.slideTo(activeIndex, 300); // Плавно переходим на нужный слайд
        }
    }, [activeIndex]);

    // Функция для синхронизации: Пользователь свайпнул -> URL должен измениться
    const handleSlideChange = (swiper: SwiperCore) => {
        // Если навигация была программной, игнорируем этот вызов
        if (isNavigatingRef.current) {
            isNavigatingRef.current = false;
            return;
        }
        // Обновляем URL в соответствии со свайпом пользователя
        const newPath = pages[swiper.activeIndex];
        if (location.pathname !== newPath) {
            navigate(newPath);
        }
    };

    return (
        <Swiper
            // Инициализация Swiper
            onSwiper={(swiper) => {
                swiperRef.current = swiper;
            }}
            // Устанавливаем начальный слайд в соответствии с URL
            initialSlide={activeIndex}
            // Вызывается, когда пользователь ЗАКОНЧИЛ свайп
            onSlideChangeTransitionEnd={handleSlideChange}
            style={{ height: '100%', width: '100%' }}
        >
            {/* Порядок слайдов должен СТРОГО соответствовать порядку в массиве `pages` */}
            <SwiperSlide><PhotoContainer /></SwiperSlide>
            <SwiperSlide><BatyrContainer /></SwiperSlide>
            <SwiperSlide><MapOfBatyrs /></SwiperSlide>
        </Swiper>
    );
}