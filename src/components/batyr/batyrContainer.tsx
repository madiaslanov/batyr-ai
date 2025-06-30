import { Batyr } from "./ui/batyr.tsx";

export const BatyrContainer = () => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    return <Batyr tgUser={tgUser} />;
};
