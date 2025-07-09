

import styles from "../photo.module.css";
import type {Gender} from "../module/useBatyrStore.ts";
import CustomSelect from "../../../shared/CustomSelect.tsx";

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
                   step,
                   userPhoto,
                   preview,
                   resultUrl,
                   loading,
                   isSending,
                   loadingMessage,
                   gender,
                   onFileChange,
                   onClear,
                   onNext,
                   onSendToChat,
                   onGenderChange
               }: PhotoUIProps) => {

    const genderOptions = [
        { value: 'male', label: 'Батыр (Ер)' },
        { value: 'female', label: 'Батыр-қыз (Әйел)' },
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
                <h1 className={styles.title}>🛡️ Батыр Бол!</h1>
                <div className={styles.tooltip}>
                    ℹ️
                    <span className={styles.tooltipText}>
                        Фото анық, жарық жақсы болуы керек. Бетіңіз ірі планда, камераға тік қарап тұрсын. Генерация толық аяқталғанша (1–2 минут) парақшаны жаппаңыз. Дайын болған соң "Чатқа жіберу" ді басуды ұмытпаңыз
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

                    <div className={styles.genderSelector}>
                        <label>Батыр кейіпін таңдаңыз:</label>
                        <CustomSelect
                            options={genderOptions}
                            value={gender}
                            onChange={handleCustomSelectChange}
                            disabled={!!userPhoto}
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button className={styles.button} onClick={onClear}>Өшіру</button>
                        <button className={styles.button} onClick={onNext} disabled={loading || !userPhoto}>
                            Батыр болу
                        </button>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <div className={styles.resultContainer}>
                        {loading && (
                            <div className={styles.loadingIndicator}>
                                <p className={styles.loading}>{loadingMessage}</p>
                            </div>
                        )}
                        {!loading && resultUrl && (
                            <div className={styles.resultContent}>
                                <p className={styles.loading}>{loadingMessage}</p>
                                <img src={resultUrl} alt="Результат" className={styles.resultImage}/>
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
                                    {isSending ? '🚀 Жіберілуде...' : 'Чатқа жіберу'}
                                </button>

                                <button className={styles.button} onClick={onClear}>
                                    Басқа фото жүктеу
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