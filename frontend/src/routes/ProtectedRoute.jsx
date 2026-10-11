import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="page-state">Loading your account…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children || <Outlet />;
}
