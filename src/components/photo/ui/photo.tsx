// Полностью замените содержимое файла: src/components/photo/ui/photo.tsx

import styles from "../photo.module.css";
import type {Gender} from "../module/useBatyrStore.ts";
import CustomSelect from "../../../shared/CustomSelect.tsx";
import { useTranslation } from "react-i18next";

type PhotoUIProps = {
    step: 1 | 2;
    userPhoto: File | null;
    preview: string | null;
    resultUrl: string | null;
    loading: boolean;
    isSending: boolean;
    loadingMessage: string;
    gender: Gender;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    onNext: () => void;
    onSendToChat: () => void;
    onGenderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const Photo = ({
                   step, userPhoto, preview, resultUrl, loading, isSending, loadingMessage,
                   gender, onFileChange, onClear, onNext, onSendToChat, onGenderChange
               }: PhotoUIProps) => {

    const { t } = useTranslation();

    const genderOptions = [
        { value: 'male', label: t('genderMale') },
        { value: 'female', label: t('genderFemale') },
    ];

    const handleCustomSelectChange = (value: string) => {
        const event = {
            target: { value }
        } as React.ChangeEvent<HTMLSelectElement>;
        onGenderChange(event);
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>{t('beBatyr')}</h1>
                <div className={styles.tooltip}>
                    ℹ️
                    <span className={styles.tooltipText}>{t('photoTooltip')}</span>
                </div>
            </div>

            {step === 1 && (
                <>
                    {!preview && (
                        <label className={styles.uploadLabel}>
                            <input type="file" accept="image/*" onChange={onFileChange} hidden/>
                            <div className={styles.inputIcon}></div>
                        </label>
                    )}
                    {preview && (
                        <div className={styles.preview}>
                            <img src={preview} alt="Preview" className={styles.previewImage}/>
                        </div>
                    )}

                    <div className={styles.genderSelector}>
                        <label>{t('chooseBatyrType')}</label>
                        <CustomSelect
                            options={genderOptions}
                            value={gender}
                            onChange={handleCustomSelectChange}
                            disabled={!!preview || loading}
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button className={styles.button} onClick={onClear}>{t('clear')}</button>
                        <button className={styles.button} onClick={onNext} disabled={loading || !userPhoto}>
                            {loading ? t('loading') : t('becomeBatyr')}
                        </button>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <div className={styles.resultContainer}>
                        {loading && (
                            <div className={styles.loadingIndicator}>
                                <p className={styles.loading}>{loadingMessage || t('generatingMessage')}</p>
                            </div>
                        )}
                        {!loading && resultUrl && (
                            <div className={styles.resultContent}>
                                <p className={styles.loading}>{t('photoReadyMessage')}</p>
                                <img src={resultUrl} alt="Result" className={styles.resultImage}/>
                            </div>
                        )}
                    </div>

                    <div className={styles.buttonGroup}>
                        {!loading && resultUrl && (
                            <>
                                <button
                                    className={styles.button}
                                    onClick={onSendToChat}
                                    disabled={isSending}
                                >
                                    {isSending ? t('sending') : t('sendToChat')}
                                </button>

                                <button className={styles.button} onClick={onClear}>
                                    {t('uploadAnotherPhoto')}
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