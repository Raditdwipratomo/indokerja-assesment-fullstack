import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { JobListPage } from './pages/seeker/JobListPage';
import { JobDetailPage } from './pages/seeker/JobDetailPage';
import { MyApplicationsPage } from './pages/seeker/MyApplicationsPage';
import { CompanyJobsPage } from './pages/company/CompanyJobsPage';
import { CreateJobPage } from './pages/company/CreateJobPage';
import { ApplicantsPage } from './pages/company/ApplicantsPage';
import { useAuth } from './hooks/useAuth';

function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'COMPANY') return <Navigate to="/company/jobs" replace />;
  return <Navigate to="/jobs" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<AppLayout />}>
            {/* Job Seeker Routes */}
            <Route element={<ProtectedRoute allowedRoles={['JOB_SEEKER']} />}>
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/applications" element={<MyApplicationsPage />} />
            </Route>

            {/* Company Routes */}
            <Route element={<ProtectedRoute allowedRoles={['COMPANY']} />}>
              <Route path="/company/jobs" element={<CompanyJobsPage />} />
              <Route path="/company/jobs/create" element={<CreateJobPage />} />
              <Route path="/company/jobs/:id/applicants" element={<ApplicantsPage />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
