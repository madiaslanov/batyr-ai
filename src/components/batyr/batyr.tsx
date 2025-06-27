import style from "./batyr.module.css"

const Batyr = () => {
    return (
        <>
            <div className={style.batyrContent}>
                <div className={style.holder}>
                    <div className={style.description}>
                        <img src="/homePage/profile.png" alt=""/>
                        <p>Madi</p>
                    </div>
                    <div className={style.settings}>
                        <img src="/homePage/settings.png" alt=""/>
                    </div>
                </div>
                <div className={style.batyrModel}>
                    <img src="/homePage/Hero.png" alt="hero"/>
                </div>
            </div>
        </>
    );
};

export default Batyr;