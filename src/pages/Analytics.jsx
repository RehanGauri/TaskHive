import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

const taskCompletionData = [
  { month: 'Jan', completed: 45, pending: 12, delayed: 3 },
  { month: 'Feb', completed: 52, pending: 8, delayed: 2 },
  { month: 'Mar', completed: 61, pending: 15, delayed: 5 },
  { month: 'Apr', completed: 58, pending: 10, delayed: 4 },
  { month: 'May', completed: 70, pending: 7, delayed: 1 },
  { month: 'Jun', completed: 68, pending: 9, delayed: 3 },
];

const priorityDistribution = [
  { name: 'High', value: 35, color: '#ef4444' },
  { name: 'Medium', value: 45, color: '#eab308' },
  { name: 'Low', value: 20, color: '#22c55e' },
];

const teamPerformance = [
  { name: 'Sarah Johnson', tasks: 24, completion: 92 },
  { name: 'Mike Chen', tasks: 22, completion: 88 },
  { name: 'Emma Wilson', tasks: 20, completion: 95 },
  { name: 'David Lee', tasks: 18, completion: 85 },
  { name: 'Alex Turner', tasks: 19, completion: 90 },
];

const weeklyActivity = [
  { day: 'Mon', tasks: 12 },
  { day: 'Tue', tasks: 15 },
  { day: 'Wed', tasks: 18 },
  { day: 'Thu', tasks: 14 },
  { day: 'Fri', tasks: 20 },
  { day: 'Sat', tasks: 8 },
  { day: 'Sun', tasks: 5 },
];

export function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className='mt-12'>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your team's performance and productivity metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              12%
            </span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">94%</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-950/50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              8%
            </span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">328</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tasks This Month</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="flex items-center text-xs font-medium text-red-600 dark:text-red-400">
              <TrendingDown className="w-4 h-4 mr-1" />
              3%
            </span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">2.3 days</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Completion Time</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/50 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              15%
            </span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">85%</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Team Productivity</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Task Completion Trends */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Task Completion Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskCompletionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="#eab308" radius={[8, 8, 0, 0]} />
              <Bar dataKey="delayed" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Team Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" width={100} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="completion" fill="#22c55e" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
