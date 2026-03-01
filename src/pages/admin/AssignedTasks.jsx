import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { TaskTable } from '../../components/common/TaskTable';
import { CreateTaskModal } from '../../components/common/CreateTaskModal';
import { TaskDetailModal } from '../../components/common/TaskDetailModal';

export default function AssignedTasks() {
  const { currentUser, users, getUserById } = useAuth();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const assignedTasks = tasks.filter((t) => t.type === 'assigned');

  const handleCreate = (data) => {
    const newTask = {
      ...data,
      id: String(Date.now()),
      type: 'assigned',
      createdBy: currentUser.id,
      assignedTo: data.assignedTo,
      createdAt: new Date().toISOString(),
    };
    addTask(newTask);
  };

  const getAssigneeName = (id) => getUserById(id)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mt-12">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Assigned Tasks
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          New Assigned Task
        </button>
      </div>

      <TaskTable
        tasks={assignedTasks}
        onTaskClick={setSelectedTask}
        onDelete={(id) => deleteTask(id)}
        getAssigneeName={getAssigneeName}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={(updated) => {
            updateTask(updated);
            setSelectedTask(null);
          }}
          onDelete={(id) => {
            deleteTask(id);
            setSelectedTask(null);
          }}
          getAssigneeName={getAssigneeName}
        />
      )}

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateTask={handleCreate}
        showAssignee={true}
        users={users}
      />
    </div>
  );
}
