import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { TaskTable } from '../../components/common/TaskTable';
import { TaskDetailModal } from '../../components/common/TaskDetailModal';
import { CreateTaskModal } from '../../components/common/CreateTaskModal';

export default function MyTasks() {
  const { currentUser, getUserById } = useAuth();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const myTasks = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'assigned'
  );

  const handleCreate = (data) => {
    const newTask = {
      title: data.title,
      description: data.description,
      type: 'assigned',
      assignedTo: currentUser.id,
      priority: data.priority,
      status: data.status,
      createdAt: new Date().toISOString(),
    };
    addTask(newTask);
  };

  const getAssigneeName = (id) => getUserById(id)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mt-12" >
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          My Assigned Tasks
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          New Task
        </button>
      </div>

      <TaskTable
        tasks={myTasks}
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
        showAssignee={false}
      />
    </div>
  );
}
