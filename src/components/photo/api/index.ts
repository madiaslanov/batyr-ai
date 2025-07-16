import type {Gender} from "../module/useBatyrStore.ts";


const API_BASE_URL = "https://api.batyrai.com";

// FIX: Добавили новый параметр lang
const getTelegramInitData = (lang: string): string => {
    // @ts-ignore
    const initData = window.Telegram?.WebApp?.initData || '';
    if (!initData) {
        // FIX: Ошибка теперь зависит от языка, хотя t() тут недоступен напрямую
        const errorMessages: { [key: string]: string } = {
            ru: "Не удалось получить данные авторизации Telegram. Пожалуйста, перезапустите приложение.",
            en: "Failed to get Telegram authorization data. Please restart the app.",
            kz: "Telegram авторизация деректерін алу мүмкін болмады. Қосымшаны қайта іске қосыңыз.",
        };
        throw new Error(errorMessages[lang] || errorMessages['ru']);
    }
    return initData;
};

// FIX: Добавили параметр `lang`
export const startFaceSwapTask = async (file: File, gender: Gender, lang: string): Promise<{ job_id: string, remaining_attempts: number }> => {
    const formData = new FormData();
    formData.append("user_photo", file);
    formData.append("gender", gender);
    const initData = getTelegramInitData(lang);

    // @ts-ignore
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    const headers = new Headers();
    headers.append('X-Telegram-Init-Data', initData);
    headers.append('Accept-Language', lang); // FIX: Добавляем заголовок с языком

    // Эти заголовки не стандартные и могут вызывать проблемы с некоторыми серверами,
    // но если бэкенд их ожидает, оставляем.
    headers.append('X-Telegram-User-Id', String(tgUser.id));
    const encodeHeader = (str: string) => btoa(unescape(encodeURIComponent(str || '')));
    headers.append('X-Telegram-Username', encodeHeader(tgUser.username));
    headers.append('X-Telegram-First-Name', encodeHeader(tgUser.first_name));

    try {
        const response = await fetch(`${API_BASE_URL}/api/start-face-swap`, {
            method: 'POST',
            body: formData,
            headers: headers,
        });

        const data = await response.json();
        if (!response.ok) {
            // Теперь бэкенд вернет ошибку на нужном языке в поле `detail`
            throw new Error(data.detail || "Произошла неизвестная ошибка.");
        }
        return data;
    } catch (error) {
        console.error("Failed to start face swap task:", error);
        throw error;
    }
};

// FIX: Добавили параметр `lang`
export const getTaskStatus = async (jobId: string, lang: string): Promise<any> => {
    const headers = new Headers();
    headers.append('X-Telegram-Init-Data', getTelegramInitData(lang));
    headers.append('Accept-Language', lang); // FIX: Добавляем заголовок с языком

    try {
        const response = await fetch(`${API_BASE_URL}/api/task-status/${jobId}`, { headers });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Задача не найдена.");
        }
        return data;
    } catch (error){
        console.error(`Failed to get status for job ${jobId}:`, error);
        throw error;
    }
};

// FIX: Добавили параметр `lang`
export const sendPhotoToChat = async (imageUrl: string, lang: string): Promise<{ status: string }> => {
    const initData = getTelegramInitData(lang);

    const headers = new Headers();
    headers.append('X-Telegram-Init-Data', initData);
    headers.append('Accept-Language', lang); // FIX: Добавляем заголовок с языком
    headers.append('Content-Type', 'application/json');

    try {
        const response = await fetch(`${API_BASE_URL}/api/send-photo-to-chat`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ imageUrl: imageUrl }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Сервер вернул ошибку при отправке фото");
        }
        return data;
    } catch (error) {
        console.error("Ошибка при запросе на отправку фото в чат:", error);
        throw error;
    }
};