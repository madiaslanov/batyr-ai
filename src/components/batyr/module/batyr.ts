import { useState } from "react";

export const useBatyrState = () => {
    const [page, setPage] = useState(1);
    const totalPages = 3;

    return {
        page,
        totalPages,
        next: () => setPage((p) => Math.min(p + 1, totalPages)),
        prev: () => setPage((p) => Math.max(p - 1, 1)),
    };
};