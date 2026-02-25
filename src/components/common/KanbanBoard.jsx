import { Calendar } from 'lucide-react';

export function KanbanBoard({ tasks, setTasks }) {
  const columns = [
    { id: 'pending', title: 'Pending', status: 'pending' },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress' },
    { id: 'completed', title: 'Completed', status: 'completed' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);
        return (
          <div key={column.id} className="flex flex-col">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
                  <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs font-medium">
                    {columnTasks.length}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3 min-h-[400px]">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-gray-50 dark:bg-gray-800 border-l-4 ${getPriorityColor(
                      task.priority
                    )} rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{task.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{task.dueDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {task.assignee.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{task.assignee}</span>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          task.priority === 'high'
                            ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400'
                            : 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
