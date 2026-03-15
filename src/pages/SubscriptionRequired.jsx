import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

export default function SubscriptionRequired() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const { subscription } = useSubscription();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <CheckSquare className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">TaskHive</span>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {subscription?.subscription_status === 'trial' ? 'Trial Expired' : 'Subscription Required'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {subscription?.subscription_status === 'trial'
            ? 'Your trial has ended. Subscribe to continue using TaskHive.'
            : 'Your subscription has expired. Please renew to continue.'}
        </p>

        {currentUser?.role === 'admin' ? (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              View Pricing Plans
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              Please contact your administrator to renew the subscription.
            </p>
            <button onClick={handleLogout} className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}