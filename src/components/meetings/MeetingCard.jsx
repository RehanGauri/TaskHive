export function MeetingCard({ meeting, userMap = {} }) {
  const start = new Date(meeting.created_at);
  const now = new Date();
  let status = 'Upcoming';
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  if (now >= start && now <= end) status = 'Ongoing';
  if (now > end) status = 'Ended';

  const participantsNames = meeting.participants
    ? meeting.participants.map((id) => userMap[id] || id).join(', ')
    : '';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {meeting.title || 'Untitled meeting'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {participantsNames}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {start.toLocaleString()}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full 
            ${
              status === 'Upcoming'
                ? 'bg-blue-100 text-blue-800'
                : status === 'Ongoing'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
        >
          {status}
        </span>
        <button
          onClick={() => window.open(meeting.meet_link, '_blank')}
          className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
}