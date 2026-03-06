import { Navigate, Outlet } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';

export default function SubscriptionGuard() {
  const { isAccessAllowed, loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAccessAllowed()) return <Navigate to="/subscription-required" replace />;
  return <Outlet />;
}