import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import UsersPage from './pages/UsersPage';
import JobCategories from './pages/JobCategories';
import Jobs from './pages/Jobs';
import Reports from './pages/Reports';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="categories" element={<JobCategories />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
