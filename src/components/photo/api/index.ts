// /src/api.ts

// Укажите здесь базовый URL вашего API.
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
    headers.append('X-Telegram-Username', tgUser.username || 'unknown');
    headers.append('X-Telegram-First-Name', tgUser.first_name || 'unknown');

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
 * ✅ НОВАЯ ФУНКЦИЯ
 * Запрашивает у нашего бэкенда скачать изображение с удаленного URL.
 * Это решает проблему с CORS при скачивании.
 * @param imageUrl - Полный URL изображения для скачивания (например, от piapi.ai).
 * @returns Promise, который разрешается в объект Blob (бинарные данные картинки).
 */
export const downloadImageProxy = async (imageUrl: string): Promise<Blob> => {
    // Формируем URL к нашему прокси-эндпоинту на бэкенде
    const proxyUrl = `${API_BASE_URL}/api/download-image?url=${encodeURIComponent(imageUrl)}`;

    try {
        // Делаем запрос к НАШЕМУ серверу
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            // Если наш бэкенд вернул ошибку, обрабатываем ее
            const errorData = await response.json().catch(() => ({ detail: `Сервер вернул ошибку ${response.status}` }));
            throw new Error(errorData.detail || "Не удалось скачать файл.");
        }

        // Если все успешно, возвращаем данные картинки как Blob
        return await response.blob();

    } catch (error) {
        console.error("Ошибка при скачивании файла через прокси:", error);
        // Перебрасываем ошибку дальше, чтобы UI мог ее показать
        throw error;
    }
};