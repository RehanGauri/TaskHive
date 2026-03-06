import { useState, useEffect } from 'react';
import { UserSelectList } from './UserSelectList';
import { Video, X, ExternalLink } from 'lucide-react';

export function CreateMeetingModal({ isOpen, onClose, onCreate, users = [], creating = false, currentUserId }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [title, setTitle] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
      setTitle('');
      setMeetLink('');
      setError('');
    }
  }, [isOpen]);

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleOpenGoogleMeet = () => {
    window.open('https://meet.google.com/new', '_blank');
  };

  const handleSubmit = () => {
    if (!title.trim()) return setError('Please enter a meeting title');
    if (selectedIds.length === 0) return setError('Select at least one participant');
    if (!meetLink.trim()) return setError('Please paste the Google Meet link');
    if (!meetLink.includes('meet.google.com')) return setError('Please enter a valid Google Meet link');

    const allParticipants = currentUserId
      ? [...new Set([currentUserId, ...selectedIds])]
      : selectedIds;

    onCreate({ title, participantIds: allParticipants, meetLink: meetLink.trim() });
  };

  if (!isOpen) return null;

  const otherUsers = users.filter((u) => u.id !== currentUserId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Meeting</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {/* Step 1 */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              Step 1 — Create a Google Meet room
            </p>
            <button
              type="button"
              onClick={handleOpenGoogleMeet}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Google Meet
            </button>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              Copy the meeting link from Google Meet and paste it below.
            </p>
          </div>

          {/* Step 2 — paste link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Step 2 — Paste Meet Link
            </label>
            <input
              type="url"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Sync, Project Review..."
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Participants */}
          <UserSelectList
            users={otherUsers}
            selected={selectedIds}
            onChange={toggleUser}
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            disabled={creating}
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4" />
            {creating ? 'Creating...' : 'Save Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
}