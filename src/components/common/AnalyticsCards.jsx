import { CheckCircle2, Clock, XCircle, ListTodo } from 'lucide-react';

export function AnalyticsCards({ stats }) {
  const cards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      change: '+12%',
      changePositive: true,
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-950/50',
      iconColor: 'text-green-600 dark:text-green-400',
      change: '+8%',
      changePositive: true,
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/50',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      change: '-3%',
      changePositive: false,
    },
    {
      title: 'Delayed',
      value: stats.delayed,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-950/50',
      iconColor: 'text-red-600 dark:text-red-400',
      change: '-15%',
      changePositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <span
                className={`text-xs font-medium ${
                  card.changePositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {card.change}
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
              {card.value}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
          </div>
        );
      })}
    </div>
  );
}
