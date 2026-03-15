import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function TrialBanner() {
  const { subscription, trialMsLeft } = useSubscription();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(trialMsLeft());

  useEffect(() => {
    if (!subscription || subscription.subscription_status !== 'trial') return;

    // Set initial value
    setTimeLeft(trialMsLeft());

    // Tick every second for real countdown
    const interval = setInterval(() => {
      const ms = trialMsLeft();
      setTimeLeft(ms);
      if (ms <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [subscription]);

  // Only show for admin on trial
  if (!subscription || subscription.subscription_status !== 'trial') return null;
  if (currentUser?.role !== 'admin') return null;

  // Only show when 3 days or less remain
  const totalDays = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  if (totalDays > 3 && timeLeft > 0) return null;

  // Format countdown: Xd Xh Xm Xs
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const isUrgent = days === 0;
  const isExpired = timeLeft <= 0;

  const countdownStr = isExpired
    ? 'Expired'
    : days > 0
    ? `${days}d ${hours}h ${minutes}m ${seconds}s`
    : `${hours}h ${minutes}m ${seconds}s`;

  return (
    <div className={`w-full px-4 py-2.5 flex items-center justify-between gap-4 text-sm font-medium z-40 relative ${
      isExpired || isUrgent
        ? 'bg-red-500 text-white'
        : 'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300 border-b border-orange-200 dark:border-orange-900'
    }`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          {isExpired
            ? 'Your free trial has expired!'
            : `Free trial ends in: `}
          {!isExpired && (
            <span className="font-mono font-bold ml-1">{countdownStr}</span>
          )}
        </span>
      </div>
      <button
        onClick={() => navigate('/pricing')}
        className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
          isExpired || isUrgent
            ? 'bg-white text-red-600 hover:bg-red-50'
            : 'bg-orange-600 text-white hover:bg-orange-700'
        }`}
      >
        Upgrade Now
      </button>
    </div>
  );
}