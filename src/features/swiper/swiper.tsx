

import { Swiper, SwiperSlide } from 'swiper/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import SwiperCore from 'swiper';


import 'swiper/css';


import { BatyrContainer } from "../../components/batyr/batyrContainer.tsx";
import PhotoContainer from "../../components/photo/photoContainer.tsx";
import MapOfBatyrs from "../../components/mapOfBatyrs/mapOfBatyrs.tsx";

const pages = ['/generatePhoto', '/', '/mapOfBatyrs'];

export default function SwipeRouter() {
    const location = useLocation();
    const navigate = useNavigate();
    const swiperRef = useRef<SwiperCore | null>(null);
    const isNavigatingRef = useRef(false);

    const activeIndex = pages.indexOf(location.pathname);

    useEffect(() => {
        if (!swiperRef.current) return;

        swiperRef.current.update();


        if (swiperRef.current.activeIndex !== activeIndex && activeIndex > -1) {
            isNavigatingRef.current = true;
            swiperRef.current.slideTo(activeIndex, 300);
        }
    }, [activeIndex]);


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

            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            initialSlide={activeIndex}
            onSlideChangeTransitionEnd={handleSlideChange}
            style={{ height: '100%', width: '100%' }}


            allowSlidePrev={activeIndex > 0}
            allowSlideNext={activeIndex < pages.length - 1}
            resistanceRatio={0}
        >
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