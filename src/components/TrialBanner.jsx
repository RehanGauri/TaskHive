import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle } from 'lucide-react';

export function TrialBanner() {
  const { subscription, trialDaysLeft } = useSubscription();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!subscription || subscription.subscription_status !== 'trial') return null;
  if (currentUser?.role !== 'admin') return null;

  const days = trialDaysLeft();
  if (days > 7) return null;

  const isUrgent = days <= 2;

  return (
    <div className={`w-full px-4 py-2.5 flex items-center justify-between gap-4 text-sm font-medium z-40 relative ${
      isUrgent
        ? 'bg-red-500 text-white'
        : 'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300 border-b border-orange-200 dark:border-orange-900'
    }`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          {days === 0
            ? 'Your free trial expires today!'
            : `Free trial ends in ${days} day${days !== 1 ? 's' : ''}.`}
        </span>
      </div>
      <button
        onClick={() => navigate('/pricing')}
        className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
          isUrgent
            ? 'bg-white text-red-600 hover:bg-red-50'
            : 'bg-orange-600 text-white hover:bg-orange-700'
        }`}
      >
        Upgrade Now
      </button>
    </div>
  );
}