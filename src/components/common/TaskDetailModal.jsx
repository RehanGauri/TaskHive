import { X, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function TaskDetailModal({ task, onClose, onSave, onDelete, getAssigneeName }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(task);

  if (!task) return null;

  const handleClose = () => {
    setIsEditing(false);
    onClose && onClose();
  };

  const handleStatusChange = (newStatus) => {
    const updated = { ...editData, status: newStatus };
    setEditData(updated);
    if (onSave) onSave(updated);
  };

  const handleSaveEdit = () => {
    onSave && onSave(editData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete && onDelete(task.id);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="text-2xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded"
            />
          ) : (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
          )}
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{task.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Assignee</p>
              <p className="font-medium text-gray-900 dark:text-white mt-1">
                {editData.assigneeName || (getAssigneeName ? getAssigneeName(editData.assignedTo) : '')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                  className="mt-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-white mt-1">{editData.dueDate}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Priority</p>
              {isEditing ? (
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="mt-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                  editData.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                  editData.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' :
                  'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                }`}>
                  {editData.priority.charAt(0).toUpperCase() + editData.priority.slice(1)}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <select 
                value={editData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="mt-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 flex-wrap">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSaveEdit} 
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(task);
                  }} 
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={handleDelete} 
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button 
                  onClick={handleClose} 
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}