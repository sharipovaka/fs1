import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Глобальные библиотеки стилей. Импортируются один раз и попадают в общий бандл,
// поэтому на GitHub Pages не требуется ни одного внешнего CDN-запроса.
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';

import App from './App.jsx';
import { ThemeProvider } from './theme.jsx';

/*
 * basename берётся из import.meta.env.BASE_URL — это значение опции `base`
 * из vite.config.js (например «/math-department/»). Благодаря этому один и тот же
 * код работает и на localhost, и в подпапке GitHub Pages: React Router сам
 * добавляет префикс ко всем ссылкам и маршрутам.
 */
const basename = import.meta.env.BASE_URL;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
