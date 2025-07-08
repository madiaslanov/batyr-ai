// src/pages/ShezhirePage/ShezhirePage.tsx

import { useState, useEffect } from 'react';
// ✅ 1. Импортируем useNavigate
import { useNavigate } from 'react-router-dom';
import style from './ShezhirePage.module.css';

// ВАЖНО: Укажите здесь URL вашего бэкенда
const BACKEND_URL = "http://127.0.0.1:8000";

interface Person {
    id: number;
    full_name: string;
    parent_id: number | null;
}

export const ShezhirePage = () => {
    // ✅ 2. Получаем функцию навигации
    const navigate = useNavigate();

    const [currentNode, setCurrentNode] = useState<Person | null>(null);
    const [children, setChildren] = useState<Person[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNode = async (id: number) => {
        setIsLoading(true);
        setError(null);
        setSearchResults([]);
        setSearchQuery('');

        try {
            const [personRes, childrenRes] = await Promise.all([
                fetch(`${BACKEND_URL}/person/${id}`),
                fetch(`${BACKEND_URL}/person/${id}/children`)
            ]);

            if (!personRes.ok || !childrenRes.ok) {
                throw new Error('Деректерді жүктеу кезінде қате пайда болды');
            }

            const personData = await personRes.json();
            const childrenData = await childrenRes.json();

            setCurrentNode(personData);
            setChildren(childrenData);

        } catch (e: any) {
            setError(e.message || 'Белгісіз қате');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await fetch(`${BACKEND_URL}/search/?name=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Іздеу сәтсіз аяқталды');
            const data = await res.json();
            setSearchResults(data);
        } catch (e) {
            console.error("Search error:", e);
        }
    };

    useEffect(() => {
        fetchNode(1);
    }, []);

    const handleChildClick = (childId: number) => {
        fetchNode(childId);
    };

    const handleParentClick = () => {
        if (currentNode && currentNode.parent_id) {
            fetchNode(currentNode.parent_id);
        }
    };

    return (
        <div className={style.container}>
            {/* ✅ 3. ДОБАВЛЯЕМ КНОПКУ ВЫХОДА */}
            <button onClick={() => navigate(-1)} className={style.exitButton}>
                ← Басты бетке
            </button>

            <h1 className={style.title}>Шежіре</h1>

            <div className={style.searchBox}>
                <input
                    type="text"
                    placeholder="Адамды іздеу..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={style.input}
                />
                {searchResults.length > 0 && (
                    <ul className={style.results}>
                        {searchResults.map(person => (
                            <li key={person.id} onClick={() => fetchNode(person.id)}>
                                {person.full_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isLoading && <div className={style.loading}>Жүктелуде...</div>}
            {error && <div className={style.error}>{error}</div>}

            {!isLoading && currentNode && (
                <>
                    {currentNode.parent_id && (
                        <button onClick={handleParentClick} className={style.backButton}>
                            ← Артқа ({currentNode.full_name} әкесіне)
                        </button>
                    )}

                    <div className={style.nodeDisplay}>
                        <h2 className={style.nodeName}>{currentNode.full_name}</h2>
                    </div>

                    <h3 className={style.childrenTitle}>Ұрпақтары:</h3>
                    {children.length > 0 ? (
                        <ul className={style.childrenList}>
                            {children.map(child => (
                                <li key={child.id} onClick={() => handleChildClick(child.id)}>
                                    {child.full_name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={style.noChildren}>Ұрпақтары туралы деректер жоқ</p>
                    )}
                </>
            )}
        </div>
    );
};