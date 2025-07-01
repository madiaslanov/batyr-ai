export async function postTTS(text: string): Promise<HTMLAudioElement> {
    const res = await fetch("http://172.171.242.191:3000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });

    const blob = await res.blob();

    if (blob.size === 0) {
        throw new Error("Empty audio");
    }

    return new Audio(URL.createObjectURL(blob));
}