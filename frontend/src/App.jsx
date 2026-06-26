import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FullPageLoader } from './components/shared/UI';
import Layout from './components/shared/Layout';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import MenteeProfilePage from './components/mentee/MenteeProfilePage';
import MenteeAcademicsPage from './components/mentee/MenteeAcademicsPage';
import MenteeAchievementsPage from './components/mentee/MenteeAchievementsPage';
import MentorDashboard from './components/mentor/MentorDashboard';
import MentorMenteesPage from './components/mentor/MentorMenteesPage';
import MenteeDetailPage from './components/mentor/MenteeDetailPage';

// Route guard: requires auth
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Route guard: requires specific role
function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'mentor' ? '/mentor/dashboard' : '/mentee/profile'} replace />;
  return children;
}

// Public-only route (redirect if already logged in)
function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to={user.role === 'mentor' ? '/mentor/dashboard' : '/mentee/profile'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

      {/* Mentee routes */}
      <Route path="/mentee/*" element={
        <RequireRole role="mentee">
          <Layout>
            <Routes>
              <Route path="profile" element={<MenteeProfilePage />} />
              <Route path="academics" element={<MenteeAcademicsPage />} />
              <Route path="achievements" element={<MenteeAchievementsPage />} />
              <Route path="*" element={<Navigate to="/mentee/profile" replace />} />
            </Routes>
          </Layout>
        </RequireRole>
      } />

      {/* Mentor routes */}
      <Route path="/mentor/*" element={
        <RequireRole role="mentor">
          <Layout>
            <Routes>
              <Route path="dashboard" element={<MentorDashboard />} />
              <Route path="mentees" element={<MentorMenteesPage />} />
              <Route path="mentee/:menteeId" element={<MenteeDetailPage />} />
              <Route path="*" element={<Navigate to="/mentor/dashboard" replace />} />
            </Routes>
          </Layout>
        </RequireRole>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
