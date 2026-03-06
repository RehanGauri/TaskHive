import { useState } from 'react';
import { CheckSquare, Check, Zap, Shield, Building2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 800,
    usd: 10,
    icon: Zap,
    color: 'blue',
    description: 'Perfect for small teams getting started',
    planId: 'plan_SNTfThtHBERG6k',
    features: ['Up to 5 users', 'Task management', 'Meetings', 'Email support', '5GB storage'],
    notIncluded: ['Analytics', 'Priority support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 1600,
    usd: 20,
    icon: Shield,
    color: 'purple',
    popular: true,
    description: 'Best for growing teams',
    planId: 'plan_SNTgncSIpqc9yW',
    features: ['Up to 15 users', 'Everything in Starter', 'Advanced analytics', 'Priority meetings', 'Priority support', '50GB storage'],
    notIncluded: [],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 3200,
    usd: 39,
    icon: Building2,
    color: 'gray',
    description: 'For large organizations',
    planId: 'plan_SNThNtKI0VN5MI',
    features: ['Up to 30 users', 'Everything in Pro', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'Unlimited storage', 'Custom branding'],
    notIncluded: [],
  },
];

const colorMap = {
  blue: {
    icon: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    check: 'text-blue-500',
    border: 'border-gray-200 dark:border-gray-800',
  },
  purple: {
    icon: 'bg-purple-100 dark:bg-purple-950/50 text-purple-600',
    button: 'bg-purple-600 hover:bg-purple-700',
    check: 'text-purple-500',
    border: 'border-purple-500',
  },
  gray: {
    icon: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
    button: 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600',
    check: 'text-gray-500 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-800',
  },
};

export default function Pricing() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { subscription, fetchSubscription } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState(null);

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

      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          subscription_id: data.subscriptionId,
          name: 'TaskHive',
          description: `${plan.name} Plan - Monthly`,
          image: '/favicon.ico',
          prefill: {
            email: currentUser.email,
          },
          theme: { color: '#2563eb' },
          handler: async (response) => {
            // Payment successful — verify on backend
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
              console.error('Verify error:', err);
              alert('Payment verification error. Please contact support.');
            }
          },
          modal: {
            ondismiss: () => setLoadingPlan(null),
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoadingPlan(null);
      };
    } catch (err) {
      console.error('Subscribe error:', err);
      alert(err.message);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">TaskHive</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Choose the plan that fits your team. All plans include a 7-day free trial.
        </p>
        {subscription?.subscription_status === 'trial' && (
          <div className="mt-4 inline-block px-4 py-2 bg-orange-100 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-full text-sm text-orange-700 dark:text-orange-400 font-medium">
            ⚠️ Your free trial has expired — subscribe to continue
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const colors = colorMap[plan.color];
          const isCurrentPlan = subscription?.plan_type === plan.id && subscription?.subscription_status === 'active';

          return (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-900 rounded-2xl border-2 shadow-sm flex flex-col ${colors.border} ${
                plan.popular ? 'shadow-purple-100 dark:shadow-purple-950/20' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                    Most Popular
                  </span>
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
                      <Check className={`w-4 h-4 shrink-0 ${colors.check}`} />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-400 line-through">
                      <Check className="w-4 h-4 shrink-0 text-gray-300" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 pt-0">
                {isCurrentPlan ? (
                  <div className="w-full py-3 text-center bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-xl font-semibold text-sm">
                    ✓ Current Plan
                  </div>
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