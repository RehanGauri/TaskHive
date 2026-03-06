import { MoreVertical, Calendar, Eye, Edit2, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

function ActionMenu({ task, onView, onDelete, onClose, buttonRef }) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 120;
      const menuWidth = 192;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow < menuHeight
        ? rect.top - menuHeight + window.scrollY
        : rect.bottom + window.scrollY + 4;
      const left = Math.min(
        rect.right - menuWidth + window.scrollX,
        window.innerWidth - menuWidth - 8
      );
      setPosition({ top, left });
    }
  }, [buttonRef]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return createPortal(
    <div
      ref={menuRef}
      style={{ top: position.top, left: position.left }}
      className="fixed w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999]"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onView(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm transition-colors border-b border-gray-200 dark:border-gray-700 rounded-t-lg"
      >
        <Eye className="w-4 h-4" />
        View Details
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onView(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm transition-colors border-b border-gray-200 dark:border-gray-700"
      >
        <Edit2 className="w-4 h-4" />
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm('Are you sure you want to delete this task?')) {
            onDelete();
          }
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-sm transition-colors rounded-b-lg"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>,
    document.body
  );
}

export function TaskTable({ tasks, onTaskClick = () => {}, onDelete = () => {}, getAssigneeName }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const buttonRefs = useRef({});

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900';
      case 'low': return 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No tasks yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Task</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Assignee</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Due Date</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Priority</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {tasks.map((task) => {
              const assigneeName = task.assigneeName || (getAssigneeName ? getAssigneeName(task.assignedTo) : '');
              const initials = assigneeName.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2) || '?';

              return (
                <tr
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">{task.description}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0">
                        {initials}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{assigneeName}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {task.dueDate || '—'}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : '—'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status ? task.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '—'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <button
                      ref={(el) => (buttonRefs.current[task.id] = el)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === task.id ? null : task.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === task.id && (
                      <ActionMenu
                        task={task}
                        buttonRef={{ current: buttonRefs.current[task.id] }}
                        onView={() => onTaskClick(task)}
                        onDelete={() => onDelete(task.id)}
                        onClose={() => setOpenMenuId(null)}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}