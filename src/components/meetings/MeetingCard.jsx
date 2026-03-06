import { Users, ExternalLink, Trash2, Clock } from 'lucide-react';

export function MeetingCard({ meeting, userMap = {}, onDelete, canDelete }) {
  const start = new Date(meeting.created_at);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const now = new Date();

  let status = 'Upcoming';
  let statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
  if (now >= start && now <= end) {
    status = 'Ongoing';
    statusClass = 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
  }
  if (now > end) {
    status = 'Ended';
    statusClass = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }

  const participantNames = (meeting.participants || [])
    .map((id) => userMap[id] || 'Unknown')
    .join(', ');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
          {meeting.title || 'Untitled Meeting'}
        </h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${statusClass}`}>
          {status}
        </span>
      </div>

      {/* Participants */}
      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Users className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
        <span className="line-clamp-2">
          {participantNames || 'No participants'}
          <span className="ml-1 text-xs text-gray-400">
            ({(meeting.participants || []).length} people)
          </span>
        </span>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Clock className="w-4 h-4 shrink-0" />
        <span>{start.toLocaleString()}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={() => window.open(meeting.meet_link, '_blank')}
          disabled={status === 'Ended' || meeting.meet_link === '#'}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Join Meeting
        </button>
        {canDelete && (
          <button
            onClick={() => onDelete(meeting.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}