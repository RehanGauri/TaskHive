import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function FallbackRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={
        currentUser.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
      }
      replace
    />
  );
}
