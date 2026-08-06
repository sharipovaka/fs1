import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import DisciplinePage from './pages/DisciplinePage.jsx';
import ActivityPage from './pages/ActivityPage.jsx';
import SeminarsPage from './pages/SeminarsPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import { ACTIVITIES, DISCIPLINES } from './catalog.js';

/**
 * Карта маршрутов.
 *
 * Дисциплины и активности обслуживаются одним компонентом каждая:
 * идентификатор берётся из адреса, содержимое — из каталога. Поэтому новая
 * дисциплина, добавленная в catalog/site.json, работает без правок кода.
 * Исключение — семинары: у них своя страница с расписанием.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="disciplines">
          <Route index element={<Navigate to={`/disciplines/${DISCIPLINES[0].id}`} replace />} />
          <Route path=":id" element={<DisciplinePage />} />
        </Route>

        <Route path="activities">
          <Route index element={<Navigate to={`/activities/${ACTIVITIES[0].id}`} replace />} />
          {/* Частный случай объявлен до общего, иначе его перехватит :id */}
          <Route path="seminars" element={<SeminarsPage />} />
          <Route path=":id" element={<ActivityPage />} />
        </Route>

        <Route path="about">
          <Route index element={<Navigate to="/about/history" replace />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
