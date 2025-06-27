import { useState } from "react";
import styles from "./photo.module.css";

const Photo = () => {
    const [image, setImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClear = () => setImage(null);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Telegram Photo Generator</h1>

            {!image && (
                <label className={styles.uploadLabel}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        hidden
                    />
                    <div className={styles.inputIcon} />
                </label>
            )}

            {image ? (
                <>
                    <div className={styles.preview}>
                        <img src={image} alt="Uploaded" className={styles.image} />
                    </div>
                    <button className={styles.button} onClick={handleClear}>
                        Очистить фото
                    </button>
                </>
            ) : (
                <p className={styles.placeholder}>Выберите фото для отображения</p>
            )}
        </div>
    );
};

export default Photo;
