import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.company_id) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    fetchSubscription();
  }, [currentUser?.company_id]);

  const fetchSubscription = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('companies')
      .select('subscription_status, trial_start_date, trial_end_date, plan_type, razorpay_customer_id, razorpay_subscription_id')
      .eq('id', currentUser.company_id)
      .maybeSingle();
    if (error) { console.error('fetchSubscription error', error); setLoading(false); return; }
    setSubscription(data);
    setLoading(false);
  };

  const isAccessAllowed = () => {
    if (!subscription) return false;
    if (subscription.subscription_status === 'active') return true;
    if (subscription.subscription_status === 'trial') {
      return new Date() <= new Date(subscription.trial_end_date);
    }
    return false;
  };

  const isTrialExpired = () => {
    if (!subscription) return false;
    if (subscription.subscription_status === 'expired') return true;
    if (subscription.subscription_status === 'trial') {
      return new Date() > new Date(subscription.trial_end_date);
    }
    return false;
  };

  const trialDaysLeft = () => {
    if (!subscription?.trial_end_date) return 0;
    const diff = new Date(subscription.trial_end_date) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription, loading,
      isAccessAllowed, isTrialExpired, trialDaysLeft,
      fetchSubscription,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);