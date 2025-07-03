// /src/api.ts

const API_BASE_URL = "https://api.batyrai.com";

/**
 * Отправляет фото на сервер, чтобы запустить задачу генерации в фоне.
 * @param file - Файл изображения (объект File).
 * @returns Promise, который разрешается в объект { job_id: string, remaining_attempts: number }.
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

    // ✅ ИЗМЕНЕНО: Кодируем имена, чтобы избежать ошибки с не-латинскими символами
    // Эта функция правильно кодирует Unicode (кириллицу, эмодзи) в Base64
    const encodeHeader = (str: string) => {
        try {
            // btoa может не работать с Unicode, поэтому мы сначала кодируем строку
            return btoa(unescape(encodeURIComponent(str)));
        } catch (e) {
            // В случае ошибки (например, пустая строка), возвращаем закодированное 'unknown'
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
 * Проверяет статус задачи на сервере по ее Job ID.
 * @param jobId - Уникальный ID задачи.
 * @returns Promise с данными о статусе задачи.
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
 * Запрашивает у нашего бэкенда скачать изображение с удаленного URL.
 * @param imageUrl - Полный URL изображения для скачивания.
 * @returns Promise, который разрешается в объект Blob.
 */
export const downloadImageProxy = async (imageUrl: string): Promise<Blob> => {
    const proxyUrl = `${API_BASE_URL}/api/download-image?url=${encodeURIComponent(imageUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: `Сервер вернул ошибку ${response.status}` }));
            throw new Error(errorData.detail || "Не удалось скачать файл.");
        }
        return await response.blob();

    } catch (error) {
        console.error("Ошибка при скачивании файла через прокси:", error);
        throw error;
    }
};