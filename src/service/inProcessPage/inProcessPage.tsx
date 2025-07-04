import style from "./inProgressPage.module.css";

const InProcessPage = () => {
    return (
        <div className={style.inprog}>
            <img src="/service/mechan.png" alt="Механизм в работе" />
            <p>Страница в стадии разработки</p>
        </div>
    );
};

export default InProcessPage;
