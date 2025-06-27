import {useFormContext, Controller} from "react-hook-form";
import {useState} from "react";
import style from "../generateComics.module.css";

export const Step1UploadPhoto = ({onNext}: { onNext: () => void }) => {
    const {control, handleSubmit, formState: {errors}, setValue} = useFormContext();
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const onSubmit = (data: any) => {
        if (!data.photo || data.photo.length === 0) return;
        console.log("Фото загружено:", data.photo[0]);
        onNext();
    };

    const clearImage = () => {
        setImagePreview(null);
        setValue("photo", null); // очистка поля формы
    };

    return (
        <form className={style.formImage} onSubmit={handleSubmit(onSubmit)}>
            <p>Добавьте фотографию</p>
            <div className={style.mainHolder}>

                <Controller
                    name="photo"
                    control={control}
                    rules={{required: "Пожалуйста, загрузите фото"}}
                    render={({field}) => (
                        <>
                            <input
                                type="file"
                                id="photoUpload"
                                accept="image/*"
                                style={{display: "none"}}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setImagePreview(URL.createObjectURL(file));
                                        field.onChange(e.target.files);
                                    }
                                }}
                            />
                            <label htmlFor="photoUpload" className={style.uploadLabel}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className={style.previewImage}/>
                                ) : (
                                    <img src="/generatePage/icon.png" alt="Upload" className={style.uploadIcon}/>
                                )}
                            </label>
                        </>
                    )}
                />

                {errors.photo && (
                    <span className={style.errorText}>{errors.photo.message?.toString()}</span>
                )}

            </div>
            <div className={style.navBtn}>
                <button type="button" className={style.btnBase} onClick={clearImage} disabled={!imagePreview}>
                    Очистить
                </button>
                <button type="submit" className={style.btnBase}>Далее</button>
            </div>
        </form>
    );
};
