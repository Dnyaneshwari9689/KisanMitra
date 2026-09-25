import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function DashboardRedirect() {
  const { profile } = useAuth();
  if (!profile) return <Navigate to="/login" replace />;
  if (profile.role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
  if (profile.role === 'buyer') return <Navigate to="/buyer/dashboard" replace />;
  if (profile.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}
