import { useFormContext } from "react-hook-form";
import style from "../generateComics.module.css";

export const Step3Download = ({ onBack }: { onBack: () => void }) => {
    const { getValues } = useFormContext();
    const { photo } = getValues();

    const imageUrl = photo?.[0] ? URL.createObjectURL(photo[0]) : null;

    const handleDownload = () => {
        // Пример: скачиваем картинку (или позже PDF)
        const link = document.createElement("a");
        link.href = imageUrl!;
        link.download = photo[0].name || "image.jpg";
        link.click();
    };

    return (
        <div className={style.sceneForm}>
            <div className={style.mainHolder}>
                <p className={style.sectionTitle}>Ваша обложка</p>
                {imageUrl && (
                    <img src={imageUrl} alt="Preview" className={style.previewImage} />
                )}

            </div>

            <div className={style.navBtn}>
                <button type="button" className={style.btnBase} onClick={onBack}>Назад</button>
                <button type="button" className={style.btnBase} onClick={handleDownload}>Скачать</button>
            </div>
        </div>
    );
};
