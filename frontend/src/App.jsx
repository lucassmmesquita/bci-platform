import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AnalystDashboard from './pages/AnalystDashboard';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import StartupList from './pages/StartupList';
import StartupDetail from './pages/StartupDetail';
import PipelineKanban from './pages/PipelineKanban';
import StartupPortal from './pages/StartupPortal';
import RankingPage from './pages/RankingPage';
import ReportsPage from './pages/ReportsPage';
import ComparisonPage from './pages/ComparisonPage';
import UserManagement from './pages/UserManagement';
import ScoringConfig from './pages/ScoringConfig';
import AuditLog from './pages/AuditLog';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, usuario } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}><div className="animate-pulse" style={{ fontSize: 14, color: 'var(--g400)' }}>Carregando...</div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(usuario?.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleBasedDashboard() {
  const { usuario } = useAuth();
  if (usuario?.role === 'executive') return <ExecutiveDashboard />;
  if (usuario?.role === 'investor') return <InvestorDashboard />;
  if (usuario?.role === 'startup') return <StartupPortal />;
  return <AnalystDashboard />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<RoleBasedDashboard />} />
              <Route path="startups" element={<StartupList />} />
              <Route path="startups/:id" element={<StartupDetail />} />
              <Route path="pipeline" element={<PipelineKanban />} />
              <Route path="ranking" element={<RankingPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="comparison" element={<ComparisonPage />} />
              <Route path="executive" element={<ExecutiveDashboard />} />
              <Route path="investor" element={<InvestorDashboard />} />
              <Route path="dealflow" element={<InvestorDashboard />} />
              <Route path="portal" element={<StartupPortal />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="scoring" element={<ScoringConfig />} />
              <Route path="audit" element={<AuditLog />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
