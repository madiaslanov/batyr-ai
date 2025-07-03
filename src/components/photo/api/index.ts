// /src/api.ts

const API_BASE_URL = "https://api.batyrai.com";

/**
 * Отправляет фото на сервер для начала генерации.
 */
export const startFaceSwapTask = async (file: File): Promise<{ job_id: string, remaining_attempts: number }> => {
    const formData = new FormData();
    formData.append("user_photo", file);

    // @ts-ignore
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    if (!tgUser?.id) {
        throw new Error("Не удалось получить данные пользователя Telegram. Пожалуйста, перезапустите приложение.");
    }

    const headers = new Headers();
    headers.append('X-Telegram-User-Id', String(tgUser.id));

    const encodeHeader = (str: string) => {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (e) {
            return btoa('unknown');
        }
    };

    headers.append('X-Telegram-Username', encodeHeader(tgUser.username || 'unknown'));
    headers.append('X-Telegram-First-Name', encodeHeader(tgUser.first_name || 'unknown'));

    try {
        const response = await fetch(`${API_BASE_URL}/api/start-face-swap`, {
            method: 'POST',
            body: formData,
            headers: headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Произошла неизвестная ошибка на сервере." }));
            throw new Error(errorData.detail || "Не удалось отправить запрос.");
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
    try {
        const response = await fetch(`${API_BASE_URL}/api/task-status/${jobId}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Задача не найдена или произошла ошибка." }));
            throw new Error(errorData.detail);
        }

        return await response.json();
    } catch (error) {
        console.error(`Failed to get status for job ${jobId}:`, error);
        throw error;
    }
};

/**
 * ✅ НОВАЯ ФУНКЦИЯ
 * Отправляет запрос на бэкенд, чтобы тот прислал готовое фото в чат с ботом.
 * @param imageUrl - URL готового изображения.
 */
export const sendPhotoToChat = async (imageUrl: string): Promise<{ status: string }> => {
    // @ts-ignore
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    if (!tgUser?.id) {
        throw new Error("Не удалось получить данные пользователя Telegram для отправки фото.");
    }

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Telegram-User-Id', String(tgUser.id));

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