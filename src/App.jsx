import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { useAuth } from './context/AuthContext';

import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Analytics } from './pages/Analytics';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';
import { MeetingsPage } from './pages/MeetingsPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

function App() {
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <BrowserRouter>
        <Routes>

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to={role === 'admin' ? '/admin-dashboard' : '/dashboard'} replace />} />

            <Route path="dashboard" element={<Dashboard />} />

            <Route
              path="admin-dashboard"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />

              <Route path="tasks" element={<Tasks />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="team" element={<Team />} />
              <Route path="meetings" element={<MeetingsPage />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch All */}
            <Route
              path="*"
              element={<Navigate to={role === 'admin' ? '/admin-dashboard' : '/dashboard'} replace />}
            />

          </Routes>
        </BrowserRouter>
      </ThemeProvider>
  );
}

export default App;