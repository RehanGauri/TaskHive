import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnalyticsCards } from '../components/common/AnalyticsCards';
import { TaskTable } from '../components/common/TaskTable';
import { TaskDetailModal } from '../components/common/TaskDetailModal';
import { CreateTaskModal } from '../components/common/CreateTaskModal';
import { addTask } from '../store/slices/taskSlice';

export function Dashboard() {
  const dispatch = useDispatch();
  const tasks = useSelector(state => state.tasks.tasks);
  const selectedTask = useSelector(state => state.tasks.selectedTask);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    delayed: tasks.filter((t) => t.status === 'pending' && t.priority === 'high').length,
  };

  const handleCreateTask = (newTask) => {
    const task = {
      ...newTask,
      id: String(Date.now()),
      description: newTask.description || 'No description provided',
    };
    dispatch(addTask(task));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your tasks today.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards stats={stats} />

      {/* Task Table */}
      <TaskTable tasks={tasks.slice(0, 6)} />

      {/* Task Detail Modal */}
      {selectedTask && <TaskDetailModal task={selectedTask} />}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}