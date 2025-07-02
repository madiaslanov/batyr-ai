export const postFaceSwap = async (userPhoto: File): Promise<any> => {
    const formData = new FormData();
    formData.append("target_image", userPhoto);

    const res = await fetch("https://batyrai.com/api/piapi/face-swap", {
        method: "POST",
        body: formData,
    });

    return res.json();
};

export const getTaskResult = async (taskId: string): Promise<any> => {
    const res = await fetch(`https://batyrai.com/api/piapi/task/${taskId}`);
    return res.json();
};
