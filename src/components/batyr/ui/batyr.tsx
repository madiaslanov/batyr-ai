import style from "./batyr.module.css";

interface BatyrProps {
    tgUser?: {
        first_name: string;
        last_name?: string;
        username?: string;
        photo_url?: string;
    };
}

export const Batyr = ({ tgUser }: BatyrProps) => {
    return (
        <div className={style.batyrContent}>
            <div className={style.holder}>
                <div className={style.description}>
                    <img src={tgUser?.photo_url || "/homePage/profile.png"} alt="Профиль" />
                    <p>{tgUser?.username || tgUser?.first_name || "Гость"}</p>
                </div>
            </div>

            <div className={style.batyrModel}>
                <img
                    src="/homePage/Hero.png"
                    alt="Герой"
                />
            </div>
        </div>
    );
};
