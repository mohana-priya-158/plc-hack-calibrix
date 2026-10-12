import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Challenges from './pages/Challenges.jsx';
import EditorPage from './pages/EditorPage.jsx';
import SimulatorPage from './pages/SimulatorPage.jsx';
import TestsPage from './pages/TestsPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="editor" element={<EditorPage />} />
        <Route path="simulator" element={<SimulatorPage />} />
        <Route path="tests" element={<TestsPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
