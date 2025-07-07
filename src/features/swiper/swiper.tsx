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
        // Проверяем, что swiper существует, его активный слайд не совпадает с URL,
        // и activeIndex валидный (не -1).
        if (swiperRef.current && swiperRef.current.activeIndex !== activeIndex && activeIndex > -1) {
            isNavigatingRef.current = true; // Сообщаем, что навигация идет программно
            swiperRef.current.slideTo(activeIndex, 300); // Плавно переходим на нужный слайд
        }
    }, [activeIndex]);

    // Функция для синхронизации: Пользователь свайпнул -> URL должен измениться
    const handleSlideChange = (swiper: SwiperCore) => {
        if (isNavigatingRef.current) {
            isNavigatingRef.current = false; // Сбрасываем флаг и выходим
            return;
        }
        // Обновляем URL в соответствии со свайпом пользователя
        const newPath = pages[swiper.activeIndex];
        if (location.pathname !== newPath) {
            navigate(newPath);
        }
    };

    // Если по какой-то причине URL не соответствует ни одной странице,
    // (например, при первом рендере), не рендерим swiper, чтобы избежать ошибок.
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

            // ✅ ГЛАВНОЕ ИЗМЕНЕНИЕ: Динамически управляем возможностью свайпа
            // Запрещаем свайпать налево (назад), если мы на первом слайде (индекс 0)
            allowSlidePrev={activeIndex > 0}

            // Запрещаем свайпать направо (вперед), если мы на последнем слайде
            allowSlideNext={activeIndex < pages.length - 1}

            // ✅ УЛУЧШЕНИЕ UX: Убираем "резиновый" эффект на краях.
            // При попытке свайпа на заблокированной стороне ничего не будет происходить.
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