import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { CheckSquare, ListTodo, Users, Clock, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();
  const { subscription, trialDaysLeft } = useSubscription();
  const navigate = useNavigate();

  const displayName = currentUser?.full_name || currentUser?.name || 'Admin';
  const firstName = displayName.split(' ')[0];

  const assignedTasks = tasks.filter((t) => t.type === 'assigned');
  const personalTasks = tasks.filter((t) => t.type === 'personal' && t.created_by === currentUser?.id);

  const completedAssigned = assignedTasks.filter((t) => t.status === 'completed' || t.status === 'done');
  const pendingAssigned = assignedTasks.filter((t) => t.status === 'pending' || t.status === 'todo' || t.status === 'in_progress');
  const overdueAssigned = assignedTasks.filter((t) => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date() && t.status !== 'completed' && t.status !== 'done';
  });

  const completionRate = assignedTasks.length > 0
    ? Math.round((completedAssigned.length / assignedTasks.length) * 100)
    : 0;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    { label: 'Total Assigned Tasks', value: assignedTasks.length, icon: CheckSquare, color: 'blue', bg: 'bg-blue-50 dark:bg-blue-950/30', iconColor: 'text-blue-600', onClick: () => navigate('/admin-dashboard/assigned') },
    { label: 'Pending Tasks', value: pendingAssigned.length, icon: Clock, color: 'orange', bg: 'bg-orange-50 dark:bg-orange-950/30', iconColor: 'text-orange-500', onClick: () => navigate('/admin-dashboard/assigned') },
    { label: 'Completed Tasks', value: completedAssigned.length, icon: TrendingUp, color: 'green', bg: 'bg-green-50 dark:bg-green-950/30', iconColor: 'text-green-600', onClick: () => navigate('/admin-dashboard/assigned') },
    { label: 'Personal Tasks', value: personalTasks.length, icon: ListTodo, color: 'purple', bg: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-600', onClick: () => navigate('/admin-dashboard/personal') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mt-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {firstName}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening with your team today.
        </p>
      </div>

      {/* Overdue alert */}
      {overdueAssigned.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            <span className="font-semibold">{overdueAssigned.length} task{overdueAssigned.length > 1 ? 's' : ''} overdue</span>
            {' '}— please review and update them.
          </p>
          <button onClick={() => navigate('/admin-dashboard/assigned')}
            className="ml-auto text-xs text-red-600 dark:text-red-400 font-semibold hover:underline shrink-0">
            View →
          </button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button key={stat.label} onClick={stat.onClick}
              className={`p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-all text-left group`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </button>
          );
        })}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Completion rate */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Task Completion Rate</h3>
            <span className="text-2xl font-bold text-blue-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{completedAssigned.length} completed</span>
            <span>{assignedTasks.length} total</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Assigned Tasks', icon: CheckSquare, path: '/admin-dashboard/assigned', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
              { label: 'Personal Tasks', icon: ListTodo, path: '/admin-dashboard/personal', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
              { label: 'Meetings', icon: Calendar, path: '/admin-dashboard/meetings', color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
              { label: 'Team', icon: Users, path: '/team', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.label} onClick={() => navigate(action.path)}
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all text-left">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subscription status */}
      {subscription?.subscription_status === 'trial' && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-900 rounded-xl flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              🎉 You're on a free trial — {trialDaysLeft()} day{trialDaysLeft() !== 1 ? 's' : ''} remaining
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Upgrade anytime to keep your team productive.</p>
          </div>
          <button onClick={() => navigate('/pricing')}
            className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Upgrade
          </button>
        </div>
      )}
      {subscription?.subscription_status === 'active' && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            ✅ Active subscription — {subscription.plan_type?.charAt(0).toUpperCase() + subscription.plan_type?.slice(1)} Plan
          </p>
        </div>
      )}
    </div>
  );
}