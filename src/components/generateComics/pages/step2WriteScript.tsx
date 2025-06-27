import {useFormContext} from "react-hook-form";
import style from "../generateComics.module.css"

export const Step2WriteScript = ({onNext, onBack}: { onNext: () => void, onBack: () => void }) => {
    const {register, handleSubmit, formState: {errors}} = useFormContext();

    const onSubmit = (data: any) => {
        console.log("Сценарий:", data.script);
        onNext();
    };

    return (
        <form className={style.sceneForm} onSubmit={handleSubmit(onSubmit)}>
            <div className={style.mainHolder}>
                <p>
                    Напиши сценарии
                </p>
                <textarea
                    {...register("script", {required: 'Введите текст для генерации...'})}
                    placeholder={`Напиши сценарий как:\n1. Я создал бота, который гений и может всё\n2. Бот сломал систему и живёт своей жизнью...`}
                    className={style.scriptArea}
                />
                {errors.script && (
                    <span className={style.errorText}>{errors.script.message?.toString()}</span>
                )}
            </div>
            <div className={style.navBtn}>
                <button type="button" onClick={onBack}>Назад</button>
                <button type="submit">Далее</button>
            </div>

        </form>
    )
        ;
};
