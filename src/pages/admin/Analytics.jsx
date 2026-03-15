import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useTasks } from '../../context/TaskContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

// ── Dummy data (always shown to non-Pro users, even if blur removed) ──
const DUMMY_COMPLETION = [
  { month: 'Jan', completed: 45, pending: 12, delayed: 3 },
  { month: 'Feb', completed: 52, pending: 8,  delayed: 2 },
  { month: 'Mar', completed: 61, pending: 15, delayed: 5 },
  { month: 'Apr', completed: 58, pending: 10, delayed: 4 },
  { month: 'May', completed: 70, pending: 7,  delayed: 1 },
  { month: 'Jun', completed: 68, pending: 9,  delayed: 3 },
];
const DUMMY_PRIORITY = [
  { name: 'High',   value: 35, color: '#ef4444' },
  { name: 'Medium', value: 45, color: '#eab308' },
  { name: 'Low',    value: 20, color: '#22c55e' },
];
const DUMMY_TEAM = [
  { name: 'Sarah Johnson', tasks: 24, completion: 92 },
  { name: 'Mike Chen',     tasks: 22, completion: 88 },
  { name: 'Emma Wilson',   tasks: 20, completion: 95 },
  { name: 'David Lee',     tasks: 18, completion: 85 },
  { name: 'Alex Turner',   tasks: 19, completion: 90 },
];
const DUMMY_WEEKLY = [
  { day: 'Mon', tasks: 12 },
  { day: 'Tue', tasks: 15 },
  { day: 'Wed', tasks: 18 },
  { day: 'Thu', tasks: 14 },
  { day: 'Fri', tasks: 20 },
  { day: 'Sat', tasks: 8  },
  { day: 'Sun', tasks: 5  },
];
const DUMMY_METRICS = {
  completionRate: 94,
  tasksThisMonth: 328,
  avgDays: '2.3',
  productivity: 85,
};

export function Analytics() {
  const { currentUser } = useAuth();
  const { subscription } = useSubscription();
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const [teamMembers, setTeamMembers] = useState([]);
  const [realMetrics, setRealMetrics] = useState(null);
  const [realWeekly, setRealWeekly] = useState([]);
  const [realPriority, setRealPriority] = useState([]);
  const [realTeam, setRealTeam] = useState([]);
  const [realCompletion, setRealCompletion] = useState([]);

  const planType = subscription?.subscription_status === 'active'
    ? (subscription?.plan_type || 'starter')
    : subscription?.subscription_status || 'trial';

  const hasAccess = planType === 'pro' || planType === 'enterprise';
  const isLocked  = !hasAccess; // starter, trial, free all locked

  // Only fetch real data if Pro/Enterprise
  useEffect(() => {
    if (!hasAccess || !currentUser?.company_id) return;
    fetchRealData();
  }, [hasAccess, currentUser?.company_id]);

  const fetchRealData = async () => {
    const companyId = currentUser.company_id;

    // Tasks this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: allTasks } = await supabase
      .from('tasks')
      .select('id, status, priority, created_at, due_date, assigned_to')
      .eq('company_id', companyId);

    if (!allTasks) return;

    const thisMonth = allTasks.filter(t => t.created_at >= monthStart);
    const completed = allTasks.filter(t => t.status === 'completed' || t.status === 'done');
    const completionRate = allTasks.length > 0
      ? Math.round((completed.length / allTasks.length) * 100) : 0;

    // Priority distribution
    const high   = allTasks.filter(t => t.priority === 'high').length;
    const medium = allTasks.filter(t => t.priority === 'medium').length;
    const low    = allTasks.filter(t => t.priority === 'low').length;
    const total  = high + medium + low || 1;

    setRealPriority([
      { name: 'High',   value: Math.round(high / total * 100),   color: '#ef4444' },
      { name: 'Medium', value: Math.round(medium / total * 100), color: '#eab308' },
      { name: 'Low',    value: Math.round(low / total * 100),    color: '#22c55e' },
    ]);

    // Weekly activity (last 7 days)
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weekly = days.map((day, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayStr = date.toISOString().split('T')[0];
      const count = allTasks.filter(t => t.created_at?.startsWith(dayStr)).length;
      return { day, tasks: count };
    });
    setRealWeekly(weekly);

    // Last 6 months completion
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short' });
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const mEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
      const mTasks = allTasks.filter(t => t.created_at >= mStart && t.created_at <= mEnd);
      months.push({
        month: label,
        completed: mTasks.filter(t => t.status === 'completed' || t.status === 'done').length,
        pending:   mTasks.filter(t => t.status === 'pending' || t.status === 'todo').length,
        delayed:   mTasks.filter(t => t.due_date && t.due_date < new Date().toISOString() && t.status !== 'completed').length,
      });
    }
    setRealCompletion(months);

    // Team performance
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('company_id', companyId);

    if (users) {
      const teamData = users.map(u => {
        const userTasks = allTasks.filter(t => t.assigned_to === u.id);
        const userCompleted = userTasks.filter(t => t.status === 'completed' || t.status === 'done');
        const rate = userTasks.length > 0 ? Math.round(userCompleted.length / userTasks.length * 100) : 0;
        return {
          name: (u.full_name || 'Unknown').split(' ')[0],
          tasks: userTasks.length,
          completion: rate,
        };
      }).filter(u => u.tasks > 0);
      setRealTeam(teamData);
    }

    setRealMetrics({
      completionRate,
      tasksThisMonth: thisMonth.length,
      avgDays: '—',
      productivity: completionRate,
    });
  };

  // Use real data for Pro/Enterprise, dummy for everyone else
  const completionData  = hasAccess ? realCompletion  : DUMMY_COMPLETION;
  const priorityData    = hasAccess ? realPriority    : DUMMY_PRIORITY;
  const teamData        = hasAccess ? realTeam        : DUMMY_TEAM;
  const weeklyData      = hasAccess ? realWeekly      : DUMMY_WEEKLY;
  const metrics         = hasAccess ? (realMetrics || DUMMY_METRICS) : DUMMY_METRICS;

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '8px',
      color: '#fff',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mt-12">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your team's performance and productivity metrics
        </p>
      </div>

      {/* Lock banner for non-Pro */}
      {isLocked && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-900 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/50 rounded-lg flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                Analytics is a Pro feature
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {planType === 'trial'
                  ? 'You\'re on a free trial — upgrade to Pro or Enterprise to unlock real analytics.'
                  : 'Starter plan doesn\'t include analytics — upgrade to Pro to unlock.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="shrink-0 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative`}>
        {isLocked && (
          <div className="absolute inset-0 z-10 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-gray-950/30 flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Upgrade to unlock</p>
            </div>
          </div>
        )}
        {[
          { label: 'Completion Rate',    value: `${metrics.completionRate}%`, trend: '+12%', up: true,  icon: Activity, bg: 'bg-blue-50 dark:bg-blue-950/50',   iconColor: 'text-blue-600' },
          { label: 'Tasks This Month',   value: metrics.tasksThisMonth,       trend: '+8%',  up: true,  icon: TrendingUp, bg: 'bg-green-50 dark:bg-green-950/50', iconColor: 'text-green-600' },
          { label: 'Avg. Completion Time', value: `${metrics.avgDays} days`,  trend: '-3%',  up: false, icon: Clock,   bg: 'bg-purple-50 dark:bg-purple-950/50', iconColor: 'text-purple-600' },
          { label: 'Team Productivity',  value: `${metrics.productivity}%`,   trend: '+15%', up: true,  icon: Activity, bg: 'bg-orange-50 dark:bg-orange-950/50', iconColor: 'text-orange-600' },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${m.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${m.iconColor}`} />
                </div>
                <span className={`flex items-center text-xs font-medium ${m.up ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {m.up ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {m.trend}
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{m.value}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm relative">
          {isLocked && <ChartLockOverlay />}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Task Completion Trends</h2>
          <div className={isLocked ? 'blur-sm pointer-events-none select-none' : ''}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="completed" fill="#3b82f6" radius={[8,8,0,0]} />
                <Bar dataKey="pending"   fill="#eab308" radius={[8,8,0,0]} />
                <Bar dataKey="delayed"   fill="#ef4444" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm relative">
          {isLocked && <ChartLockOverlay />}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Priority Distribution</h2>
          <div className={isLocked ? 'blur-sm pointer-events-none select-none' : ''}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100} dataKey="value">
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm relative">
          {isLocked && <ChartLockOverlay />}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Team Performance</h2>
          <div className={isLocked ? 'blur-sm pointer-events-none select-none' : ''}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={80} stroke="#9ca3af" />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="completion" fill="#22c55e" radius={[0,8,8,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm relative">
          {isLocked && <ChartLockOverlay />}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weekly Activity</h2>
          <div className={isLocked ? 'blur-sm pointer-events-none select-none' : ''}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="tasks" stroke="#8b5cf6" strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Overlay shown on top of blurred charts
function ChartLockOverlay() {
  const navigate = useNavigate();
  return (
    <div className="absolute inset-0 z-10 rounded-xl flex items-center justify-center">
      <div className="text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-6 py-4 rounded-xl border border-purple-200 dark:border-purple-900 shadow-lg">
        <Lock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Pro Feature</p>
        <button
          onClick={() => navigate('/pricing')}
          className="mt-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Upgrade
        </button>
      </div>
    </div>
  );
}