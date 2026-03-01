import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// role: optional string to require ('admin' or 'user')
export default function ProtectedRoute({ role }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (role && currentUser.role !== role) {
    return (
      <Navigate
        to={currentUser.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'}
        replace
      />
    );
  }
  return <Outlet />;
}
