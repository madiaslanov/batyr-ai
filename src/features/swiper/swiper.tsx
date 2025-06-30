import { Swiper, SwiperSlide } from 'swiper/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import GenerateComics from "../../components/generateComics/generateComics";
import SwiperCore from 'swiper';
import 'swiper/css';
import {BatyrContainer} from "../../components/batyr/batyrContainer.tsx";
import PhotoContainer from "../../components/photo/photoContainer.tsx";

const pages = ['/generatePhoto', '/', '/generateComics'];

export default function SwipeRouter() {
    const location = useLocation();
    const navigate = useNavigate();
    const swiperRef = useRef<SwiperCore | null>(null);
    const [currentIndex, setCurrentIndex] = useState(1); // Batyr по центру

    // Устанавливаем страницу при загрузке и запрещаем свайп влево/вправо по краям
    useEffect(() => {
        const index = pages.indexOf(location.pathname);
        if (index !== -1 && swiperRef.current) {
            swiperRef.current.slideTo(index, 1000);
            swiperRef.current.allowSlidePrev = index > 0;
            swiperRef.current.allowSlideNext = index < pages.length - 1;
            setCurrentIndex(index);
        }
    }, [location.pathname]);

    // При свайпе меняем маршрут и блокируем границы
    const handleSlideChange = (swiper: SwiperCore) => {
        const newIndex = swiper.activeIndex;

        // Блокируем свайп за 1 и 3
        swiper.allowSlidePrev = newIndex > 0;
        swiper.allowSlideNext = newIndex < pages.length - 1;

        if (newIndex !== currentIndex && Math.abs(newIndex - currentIndex) === 1) {
            const newRoute = pages[newIndex];
            navigate(newRoute);
            setCurrentIndex(newIndex);
        } else if (Math.abs(newIndex - currentIndex) > 1) {
            swiper.slideTo(currentIndex); // запрет прыжка через несколько страниц
        }
    };

    return (
        <Swiper
            onSwiper={(swiper) => {
                swiperRef.current = swiper;
                const index = pages.indexOf(location.pathname);
                swiper.slideTo(index, 0);
                swiper.allowSlidePrev = index > 0;
                swiper.allowSlideNext = index < pages.length - 1;
                setCurrentIndex(index);
            }}
            onSlideChange={handleSlideChange}
            slidesPerView={1}
            resistanceRatio={0.85}
            threshold={20}
            allowTouchMove={true}
            style={{ height: '100%', width: '100%' }}
        >
            <SwiperSlide style={{ height: '100%' }}><PhotoContainer /></SwiperSlide>
            <SwiperSlide style={{ height: '100%' }}><BatyrContainer /></SwiperSlide>
            <SwiperSlide style={{ height: '100%' }}><GenerateComics /></SwiperSlide>
        </Swiper>
    );
}
