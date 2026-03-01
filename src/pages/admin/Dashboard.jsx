import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();

  const totalAssigned = tasks.filter((t) => t.type === 'assigned').length;
  const myPersonal = tasks.filter(
    (t) => t.type === 'personal' && t.createdBy === currentUser?.id
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Tasks</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalAssigned}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your Personal Tasks
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {myPersonal}
          </p>
        </div>
      </div>
    </div>
  );
}
