// src/components/ui/photo.tsx

import styles from "../photo.module.css";
import type {Gender} from "../module/useBatyrStore.ts";
import CustomSelect from "../../../shared/CustomSelect.tsx";

// Определяем тип пропсов для компонента
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
    // 2. ВАЖНО: Тип onGenderChange нужно будет адаптировать в контейнере
    // или здесь сделать его более общим, например, onGenderChange: (value: Gender) => void;
    // Для простоты оставим как в оригинале, но адаптируем вызов ниже.
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

    // 3. Определяем массив опций для нашего кастомного селекта
    const genderOptions = [
        { value: 'male', label: 'Батыр (Ер)' },
        { value: 'female', label: 'Батыр-қыз (Әйел)' },
    ];

    // 4. Создаем обертку для onGenderChange, чтобы соответствовать интерфейсу CustomSelect
    const handleCustomSelectChange = (value: string) => {
        // Мы эмулируем событие ChangeEvent, чтобы соответствовать ожидаемому типу
        // в родительском компоненте (PhotoContainer).
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

            {/* --- Шаг 1: Выбор фото и образа --- */}
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

                    {/* 5. Заменяем <select> на <CustomSelect> */}
                    <div className={styles.genderSelector}>
                        <label>Батыр кейіпін таңдаңыз:</label> {/* htmlFor больше не нужен, т.к. нет id */}
                        <CustomSelect
                            options={genderOptions}
                            value={gender}
                            onChange={handleCustomSelectChange}
                            disabled={!!userPhoto}
                        />
                    </div>

                    {/* Кнопки управления */}
                    <div className={styles.buttonGroup}>
                        <button className={styles.button} onClick={onClear}>Өшіру</button>
                        <button className={styles.button} onClick={onNext} disabled={loading || !userPhoto}>
                            Батыр болу
                        </button>
                    </div>
                </>
            )}

            {/* --- Шаг 2: Отображение процесса и результата --- */}
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