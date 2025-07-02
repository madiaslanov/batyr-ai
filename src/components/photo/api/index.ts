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

    // <<< ИЗМЕНЕНО: Шаг 1 - Получаем данные о пользователе из Telegram Web App
    // @ts-ignore - Говорим TypeScript'у не ругаться на отсутствие типов для window.Telegram
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    if (!tgUser?.id) {
        // Если мы не смогли получить ID пользователя, нет смысла отправлять запрос
        console.error("Telegram User ID not found. Cannot proceed.");
        // Выбрасываем ошибку, чтобы UI мог ее показать
        throw new Error("Не удалось получить данные пользователя Telegram. Пожалуйста, перезапустите приложение.");
    }

    // <<< ИЗМЕНЕНО: Шаг 2 - Создаем объект заголовков
    const headers = new Headers();
    // Названия заголовков должны точно совпадать с теми, что ожидает FastAPI (x-telegram-...)
    headers.append('X-Telegram-User-Id', String(tgUser.id)); // Преобразуем ID в строку
    headers.append('X-Telegram-Username', tgUser.username || 'unknown');
    headers.append('X-Telegram-First-Name', tgUser.first_name || 'unknown');

    try {
        const response = await fetch(`${API_BASE_URL}/api/start-face-swap`, {
            method: 'POST',
            body: formData,
            headers: headers, // <<< ИЗМЕНЕНО: Шаг 3 - Добавляем заголовки в запрос
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Произошла неизвестная ошибка на сервере." }));
            // Теперь мы можем показать пользователю сообщение о закончившемся лимите
            throw new Error(errorData.detail || "Не удалось отправить запрос.");
        }

        // Ожидаем ответ вида { "job_id": "...", "remaining_attempts": X }
        return await response.json();

    } catch (error) {
        console.error("Failed to start face swap task:", error);
        // Перебрасываем ошибку дальше, чтобы UI мог ее красиво отобразить
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