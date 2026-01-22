import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SurveyCreate from './pages/SurveyCreate';
import SurveyResults from './pages/SurveyResults';
import SurveyRespond from './pages/SurveyRespond';
import RespondentHome from './pages/RespondentHome';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Respondent home - requires auth but not admin */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<RespondentHome />} />
            <Route path="/s/:slug" element={<SurveyRespond />} />
          </Route>
          {/* Admin routes with layout */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/surveys/new" element={<SurveyCreate />} />
              <Route path="/surveys/:id" element={<SurveyResults />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
