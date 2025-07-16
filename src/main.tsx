// Полностью замени содержимое файла: src/main.tsx

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App.tsx';
import './index.css';

import './i18n.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Suspense fallback="Loading...">
                <App />
            </Suspense>
        </BrowserRouter>
    </React.StrictMode>
);