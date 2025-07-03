// /src/api.ts

const API_BASE_URL = "https://api.batyrai.com";

/**
 * Получает initData и выбрасывает ошибку, если их нет.
 */
const getTelegramInitData = (): string => {
    // @ts-ignore
    const initData = window.Telegram?.WebApp?.initData || '';
    if (!initData) {
        throw new Error("Не удалось получить данные авторизации Telegram. Пожалуйста, перезапустите приложение.");
    }
    return initData;
};

/**
 * Отправляет фото на сервер для начала генерации.
 */
export const startFaceSwapTask = async (file: File): Promise<{ job_id: string, remaining_attempts: number }> => {
    const formData = new FormData();
    formData.append("user_photo", file);
    const initData = getTelegramInitData();

    // @ts-ignore
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    const headers = new Headers();
    headers.append('X-Telegram-Init-Data', initData); // Главная защита
    headers.append('X-Telegram-User-Id', String(tgUser.id)); // Для удобства на бэке

    const encodeHeader = (str: string) => btoa(unescape(encodeURIComponent(str || '')));
    headers.append('X-Telegram-Username', encodeHeader(tgUser.username));
    headers.append('X-Telegram-First-Name', encodeHeader(tgUser.first_name));

    try {
        const response = await fetch(`${API_BASE_URL}/api/start-face-swap`, {
            method: 'POST',
            body: formData,
            headers: headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Произошла неизвестная ошибка." }));
            throw new Error(errorData.detail);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to start face swap task:", error);
        throw error;
    }
};

/**
 * Проверяет статус задачи на сервере.
 */
export const getTaskStatus = async (jobId: string): Promise<any> => {
    const headers = new Headers();
    headers.append('X-Telegram-Init-Data', getTelegramInitData());

    try {
        const response = await fetch(`${API_BASE_URL}/api/task-status/${jobId}`, { headers });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Задача не найдена." }));
            throw new Error(errorData.detail);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to get status for job ${jobId}:`, error);
        throw error;
    }
};

/**
 * Отправляет запрос на бэкенд, чтобы тот прислал готовое фото в чат с ботом.
 */
export const sendPhotoToChat = async (imageUrl: string): Promise<{ status: string }> => {
    const initData = getTelegramInitData(); // Эта функция у вас уже есть

    const headers = new Headers();
    // ✅ Отправляем ТОЛЬКО initData. Заголовок с ID больше не нужен.
    headers.append('X-Telegram-Init-Data', initData);
    headers.append('Content-Type', 'application/json');

    try {
        const response = await fetch(`${API_BASE_URL}/api/send-photo-to-chat`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ imageUrl: imageUrl }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Сервер вернул ошибку при отправке фото" }));
            throw new Error(errorData.detail);
        }

        return await response.json();

    } catch (error) {
        console.error("Ошибка при запросе на отправку фото в чат:", error);
        throw error;
    }
};