// Полностью замените содержимое файла: src/layouts/Layout.tsx

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import 'swiper/css';
import style from "./layout.module.css";
import { BatyrContainer } from "../../components/batyr/batyrContainer.tsx";
import PhotoContainer from "../../components/photo/photoContainer.tsx";
import MapOfBatyrs from "../../components/mapOfBatyrs/mapOfBatyrs.tsx";

const pages = ['/generatePhoto', '/', '/mapOfBatyrs'];

export default function Layout() {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const activeIndex = pages.indexOf(location.pathname);
    const swiperRef = useRef<SwiperCore | null>(null);
    const isNavigatingByClick = useRef(false);

    // Логика для кнопки "Назад"
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg) {
            if (location.pathname !== '/') {
                tg.BackButton.show();
            } else {
                tg.BackButton.hide();
            }
        }
    }, [location.pathname]);

    // Логика для Swiper
    useEffect(() => {
        if (swiperRef.current && swiperRef.current.activeIndex !== activeIndex && activeIndex > -1) {
            isNavigatingByClick.current = true;
            swiperRef.current.slideTo(activeIndex, 300);
        }
    }, [activeIndex]);

    const handleSlideChange = (swiper: SwiperCore) => {
        swiper.params.allowSlidePrev = swiper.activeIndex > 0;
        swiper.params.allowSlideNext = swiper.activeIndex < pages.length - 1;
        swiper.update();
        if (isNavigatingByClick.current) {
            isNavigatingByClick.current = false;
            return;
        }
        const newPath = pages[swiper.activeIndex];
        if (location.pathname !== newPath) {
            navigate(newPath);
        }
    };

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div className={style.appContainer}>
            <div className={style.langSwitcher}>
                <button onClick={() => changeLanguage('kz')} className={i18n.language === 'kz' ? style.activeLang : ''}>KZ</button>
                <button onClick={() => changeLanguage('ru')} className={i18n.language === 'ru' ? style.activeLang : ''}>RU</button>
                <button onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? style.activeLang : ''}>EN</button>
            </div>
            <div className={style.mainContent}>
                <Swiper
                    onSwiper={(swiper) => { swiperRef.current = swiper; }}
                    initialSlide={activeIndex > -1 ? activeIndex : 0}
                    onSlideChange={handleSlideChange}
                    style={{ height: '100%', width: '100%' }}
                    resistanceRatio={0}
                >
                    <SwiperSlide><PhotoContainer /></SwiperSlide>
                    <SwiperSlide><BatyrContainer /></SwiperSlide>
                    <SwiperSlide><MapOfBatyrs /></SwiperSlide>
                </Swiper>
            </div>
            <nav>
                <Link to="/generatePhoto"><div className={`${style.card} ${location.pathname === "/generatePhoto" ? style.active : ""}`}><img src="/navBar_img/photo.png" alt="Photo" /><p>{t('navPhoto')}</p></div></Link>
                <Link to="/"><div className={`${style.card} ${location.pathname === "/" ? style.active : ""}`}><img src="/navBar_img/batyr.png" alt="Batyr" /><p>{t('navBatyr')}</p></div></Link>
                <Link to="/mapOfBatyrs"><div className={`${style.card} ${location.pathname === "/mapOfBatyrs" ? style.active : ""}`}><img src="/navBar_img/map2.png" alt="Map" /><p>{t('navMap')}</p></div></Link>
            </nav>
        </div>
    );
}