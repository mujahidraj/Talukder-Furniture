import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { useEffect } from 'react';

export default function ProtectedRoute() {
  const { admin, checkAuth } = useAuthStore();
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (token && !admin) {
      checkAuth();
    }
  }, [token, admin, checkAuth]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
