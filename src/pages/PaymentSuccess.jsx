import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, CheckSquare } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import logo from "../assets/images/logo.png"

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { fetchSubscription } = useSubscription();
  const { currentUser } = useAuth();
  const [counting, setCounting] = useState(5);

  useEffect(() => {
    fetchSubscription();
    const timer = setInterval(() => {
      setCounting((c) => {
        if (c <= 1) {
          clearInterval(timer);
          navigate(currentUser?.role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"> */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">

          {/* <CheckSquare className="w-6 h-6 text-white" /> */}
          <img src={logo} alt="TaskHive" className="w-14 h-14 object-contain" />
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">TaskHive</span>
      </div>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful! 🎉</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Welcome to TaskHive! Your subscription is now active.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirecting in <span className="font-bold text-blue-600">{counting}</span>s...
        </p>
        <button
          onClick={() => navigate(currentUser?.role === 'admin' ? '/admin-dashboard' : '/user-dashboard')}
          className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}