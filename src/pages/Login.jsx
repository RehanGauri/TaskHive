import { useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { loginAsAdmin, loginAsUser } = useAuth();

  const handleAdmin = () => {
    loginAsAdmin();
    navigate('/admin-dashboard');
  };

  const handleUser = () => {
    loginAsUser();
    navigate('/user-dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">TaskHive Demo</h1>
          <p className="text-gray-600 dark:text-gray-400">Choose a role to continue</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleAdmin}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Continue as Admin
          </button>
          <button
            onClick={handleUser}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
          >
            Continue as User
          </button>
        </div>
      </div>
    </div>
  );
}
