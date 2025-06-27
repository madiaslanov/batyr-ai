import { useFormContext } from "react-hook-form";

export const Step3Download = ({ onBack }: { onBack: () => void }) => {
    const { getValues } = useFormContext();
    const { photo, script } = getValues();

    return (
        <div>
            <h2>Ваши данные</h2>
            <p>Фото: {photo?.[0]?.name}</p>
            <p>Сценарий: {script}</p>
            <button onClick={onBack}>Назад</button>
            <button>Скачать</button>
        </div>
    );
};
