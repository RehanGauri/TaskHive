import { useState, useEffect } from 'react';
import { CheckSquare, Check, Zap, Shield, Building2, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 799,
    usd: 9.99,
    icon: Zap,
    color: 'blue',
    description: 'Perfect for small teams getting started',
    planId: 'plan_SRJPCAgHO6hMCa',
    features: ['1 admin + 4 users (5 total)', 'Task management', 'Meetings','Personal tasks for all', 'Email support', '1GB storage', '₹149 per extra user/month'],
    notIncluded: ['Analytics', 'Priority support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 1599,
    usd: 19.99,
    icon: Shield,
    color: 'purple',
    popular: true,
    description: 'Best for growing teams',
    planId: 'plan_SRJPVkbans9iBa',
    features: ['1 admin + 9 users (10 total)', 'Everything in Starter', 'Advanced analytics', 'Priority meetings', 'Priority support', '5GB storage', 'only ₹99 per extra user/month'],
    notIncluded: [],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2799,
    usd: 29.99,
    icon: Building2,
    color: 'gray',
    description: 'For large organizations',
    planId: 'plan_SRJQfD8pcDwgz9',
    features: ['1 admin + 19 users (20 total)', 'Everything in Pro', 'Custom integrations', 'Dedicated support', 'SLA guarantee', '10GB storage', 'only ₹79 per extra user/month', 'Custom branding', 'Fast support'],
    notIncluded: [],
  },
];

const colorMap = {
  blue: { icon: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600', button: 'bg-blue-600 hover:bg-blue-700', check: 'text-blue-500', border: 'border-gray-200 dark:border-gray-800' },
  purple: { icon: 'bg-purple-100 dark:bg-purple-950/50 text-purple-600', button: 'bg-purple-600 hover:bg-purple-700', check: 'text-purple-500', border: 'border-purple-500' },
  gray: { icon: 'bg-gray-100 dark:bg-gray-800 text-gray-600', button: 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600', check: 'text-gray-500', border: 'border-gray-200 dark:border-gray-800' },
};

export default function Pricing() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { subscription, fetchSubscription, trialMsLeft } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [timeLeft, setTimeLeft] = useState(trialMsLeft());

  // Real-time countdown on pricing page too
  useEffect(() => {
    if (!subscription || subscription.subscription_status !== 'trial') return;
    setTimeLeft(trialMsLeft());
    const interval = setInterval(() => {
      const ms = trialMsLeft();
      setTimeLeft(ms);
      if (ms <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [subscription]);

  const isExpired = timeLeft <= 0 && subscription?.subscription_status === 'trial';

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const countdownStr = days > 0
    ? `${days}d ${hours}h ${minutes}m ${seconds}s`
    : `${hours}h ${minutes}m ${seconds}s`;

  const handleSubscribe = async (plan) => {
    if (!currentUser) { navigate('/login'); return; }
    setLoadingPlan(plan.id);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const resp = await fetch(`${backendUrl}/api/create-razorpay-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.planId,
          companyId: currentUser.company_id,
          userId: currentUser.id,
          planName: plan.id,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to create subscription');

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          subscription_id: data.subscriptionId,
          name: 'TaskHive',
          description: `${plan.name} Plan - Monthly`,
          prefill: { email: currentUser.email },
          theme: { color: '#2563eb' },
          handler: async (response) => {
            try {
              const verifyResp = await fetch(`${backendUrl}/api/verify-razorpay-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_subscription_id: response.razorpay_subscription_id,
                  razorpay_signature: response.razorpay_signature,
                  companyId: currentUser.company_id,
                  planName: plan.id,
                }),
              });
              const verifyData = await verifyResp.json();
              if (verifyData.success) {
                await fetchSubscription();
                navigate('/payment-success');
              } else {
                alert('Payment verification failed. Please contact support.');
              }
            } catch (err) {
              alert('Payment verification error: ' + err.message);
            }
          },
          modal: { ondismiss: () => setLoadingPlan(null) },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoadingPlan(null);
      };
    } catch (err) {
      alert(err.message);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">TaskHive</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Simple, Transparent Pricing</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Choose the plan that fits your team. All plans include a 15-day free trial.
        </p>

        {/* ✅ Show real countdown or expired message */}
        {subscription?.subscription_status === 'trial' && (
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
            isExpired
              ? 'bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400'
              : 'bg-orange-100 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-400'
          }`}>
            <Clock className="w-4 h-4" />
            {isExpired
              ? '⚠️ Your free trial has expired — subscribe to continue'
              : `⏳ Trial ends in: `}
            {!isExpired && (
              <span className="font-mono font-bold">{countdownStr}</span>
            )}
          </div>
        )}
        {subscription?.subscription_status === 'active' && (
          <div className="mt-4 inline-block px-4 py-2 bg-green-100 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-full text-sm text-green-700 dark:text-green-400 font-medium">
            ✅ You have an active subscription — you can upgrade anytime
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const colors = colorMap[plan.color];
          const isCurrentPlan = subscription?.plan_type === plan.id && subscription?.subscription_status === 'active';

          return (
            <div key={plan.id} className={`relative bg-white dark:bg-gray-900 rounded-2xl border-2 shadow-sm flex flex-col ${colors.border} ${plan.popular ? 'shadow-purple-100 dark:shadow-purple-950/20' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full whitespace-nowrap">Most Popular</span>
                </div>
              )}
              <div className="p-6 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors.icon}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                  <p className="text-xs text-gray-400 mt-0.5">≈ ${plan.usd} USD</p>
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Check className={`w-4 h-4 shrink-0 ${colors.check}`} /> {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-400 line-through">
                      <Check className="w-4 h-4 shrink-0 text-gray-300" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 pt-0">
                {isCurrentPlan ? (
                  <div className="w-full py-3 text-center bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-xl font-semibold text-sm">✓ Current Plan</div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={!!loadingPlan}
                    className={`w-full py-3 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 ${colors.button}`}
                  >
                    {loadingPlan === plan.id ? 'Loading...' : 'Get Started'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        Secure payments powered by Razorpay. Cancel anytime.
      </p>
    </div>
  );
}