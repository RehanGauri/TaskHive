import { useState, useEffect } from 'react';
import { UserSelectList } from './UserSelectList';

export function CreateMeetingModal({
  isOpen,
  onClose,
  onCreate,
  users = [],
  creating = false,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
      setTitle('');
      setError('');
    }
  }, [isOpen]);

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) return setError('Please enter a meeting title');
    if (selectedIds.length === 0)
      return setError('You must select at least one user');
    onCreate({ title, participantIds: selectedIds });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Start New Meeting</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meeting title"
          className="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded"
        />
        <UserSelectList
          users={users}
          selected={selectedIds}
          onChange={toggleUser}
        />
        <p className="text-xs text-gray-500 mt-2">
          Google Meet calls are limited to 60&nbsp;minutes.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded"
          >
            Cancel
          </button>
          <button
            disabled={creating}
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Start Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
}