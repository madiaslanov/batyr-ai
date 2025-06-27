import style from "../generateComics.module.css"

export const ProgressBar = ({ step }: { step: number }) => (
    <div className={style.eclips}>
        <div className={`${style.eclips1} ${step >= 1 ? style.active : ""}`}><p>1</p></div>
        <div className={`${style.line} ${step >= 2 ? style.activeLine : ""}`}></div>
        <div className={`${style.eclips2} ${step >= 2 ? style.active : ""}`}><p>2</p></div>
        <div className={`${style.line} ${step >= 3 ? style.activeLine : ""}`}></div>
        <div className={`${style.eclips3} ${step >= 3 ? style.active : ""}`}><p>3</p></div>
    </div>
);
