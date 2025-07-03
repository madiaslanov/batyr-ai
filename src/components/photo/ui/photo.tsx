import styles from "../photo.module.css";

// ✅ 1. Добавляем новый пропс в тип
type PhotoUIProps = {
    step: 1 | 2;
    userPhoto: File | null;
    preview: string | null;
    resultUrl: string | null;
    loading: boolean;
    isDownloading: boolean; // Новый пропс для состояния скачивания
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    onNext: () => void;
    onDownload: () => void;
};

const Photo = ({
                   step,
                   userPhoto,
                   preview,
                   resultUrl,
                   loading,
                   isDownloading, // ✅ 2. Принимаем новый пропс здесь
                   onFileChange,
                   onClear,
                   onNext,
                   onDownload,
               }: PhotoUIProps) => {

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>🛡️ Стань Батыром</h1>
                <div className={styles.tooltip}>
                    ℹ️
                    <span className={styles.tooltipText}>
                        Фото должно быть чётким, с хорошим освещением и крупным лицом, смотрящим в камеру. Не покидайте страницу до конца генерации (1-2мин)
                    </span>
                </div>
            </div>

            {step === 1 && (
                <>
                    {!userPhoto && (
                        <label className={styles.uploadLabel}>
                            <input type="file" accept="image/*" onChange={onFileChange} hidden/>
                            <div className={styles.inputIcon}></div>
                        </label>
                    )}

                    {preview && (
                        <div className={styles.preview}>
                            <img src={preview} alt="Превью" className={styles.previewImage}/>
                        </div>
                    )}

                    <div className={styles.buttonGroup}>
                        <button className={styles.button} onClick={onClear}>Очистить</button>
                        <button className={styles.button} onClick={onNext} disabled={loading || !userPhoto}>
                            Далее
                        </button>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <div className={styles.resultContainer}>
                        {loading && (
                            <div className={styles.loadingIndicator}>
                                <p className={styles.loading}>⏳ Генерация изображения...</p>
                            </div>
                        )}

                        {!loading && resultUrl && (
                            <div className={styles.resultContent}>
                                <p className={styles.loading}>✅ Изображение готово</p>
                                <img src={resultUrl} alt="Результат" className={styles.resultImage}/>
                            </div>
                        )}
                    </div>

                    <div className={styles.buttonGroup}>
                        {!loading && resultUrl && (
                            <>
                                {/* ✅ 3. Модифицируем кнопку скачивания */}
                                <button
                                    className={styles.button}
                                    onClick={onDownload}
                                    disabled={isDownloading} // Кнопка неактивна во время скачивания
                                >
                                    {isDownloading ? '⏳ Скачивание...' : '⬇️ Скачать'}
                                </button>

                                <button className={styles.button} onClick={onClear}>
                                    Загрузить другое
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Photo;