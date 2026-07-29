import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';

// Дисциплины
import DisciplinePlans from './pages/disciplines/DisciplinePlans.jsx';
import DisciplineNotes from './pages/disciplines/DisciplineNotes.jsx';
import DisciplineTemplates from './pages/disciplines/DisciplineTemplates.jsx';
import DisciplineTasks from './pages/disciplines/DisciplineTasks.jsx';

// Активности
import ActivitiesPractice from './pages/activities/ActivitiesPractice.jsx';
import ActivitiesSpring from './pages/activities/ActivitiesSpring.jsx';
import ActivitiesSeminars from './pages/activities/ActivitiesSeminars.jsx';
import ActivitiesReports from './pages/activities/ActivitiesReports.jsx';
import ActivitiesConferences from './pages/activities/ActivitiesConferences.jsx';

/**
 * Корневой компонент приложения: описывает карту маршрутов.
 * Layout — общая обёртка (навбар + контейнер + подвал), внутрь которой
 * через <Outlet /> подставляется компонент текущего подраздела.
 * Переключение разделов происходит без перезагрузки страницы.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Приветственная страница на корневом пути */}
        <Route index element={<Home />} />

        {/* Раздел «Дисциплины» */}
        <Route path="disciplines">
          {/* /disciplines без подраздела — переадресация на первый пункт меню */}
          <Route index element={<Navigate to="/disciplines/plans" replace />} />
          <Route path="plans" element={<DisciplinePlans />} />
          <Route path="notes" element={<DisciplineNotes />} />
          <Route path="templates" element={<DisciplineTemplates />} />
          <Route path="tasks" element={<DisciplineTasks />} />
        </Route>

        {/* Раздел «Активности» */}
        <Route path="activities">
          <Route index element={<Navigate to="/activities/practice" replace />} />
          <Route path="practice" element={<ActivitiesPractice />} />
          <Route path="spring" element={<ActivitiesSpring />} />
          <Route path="seminars" element={<ActivitiesSeminars />} />
          <Route path="reports" element={<ActivitiesReports />} />
          <Route path="conferences" element={<ActivitiesConferences />} />
        </Route>

        {/* Любой неизвестный адрес */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
