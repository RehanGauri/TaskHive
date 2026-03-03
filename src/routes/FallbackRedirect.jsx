import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function FallbackRedirect() {
  const { currentUser, loading } = useAuth();
   if (loading) {
  return <div>Loading...</div>;
}

if (!currentUser) {
  return <Navigate to="/login" />;
}
  return (
    <Navigate
      to={
        currentUser.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
      }
      replace
    />
  );
}
