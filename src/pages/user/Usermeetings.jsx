import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { MeetingCard } from '../../components/meetings/MeetingCard';
import { CreateMeetingModal } from '../../components/meetings/CreateMeetingModal';
import { Video, Plus } from 'lucide-react';

export default function Meetings() {
  const { currentUser, users } = useAuth();
  const { meetings, addMeeting, deleteMeeting } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // User only sees meetings they are part of
  const myMeetings = meetings.filter((m) =>
    m.participants?.includes(currentUser?.id)
  );

  const userMap = users.reduce((acc, u) => {
    acc[u.id] = u.full_name || u.name || u.email;
    return acc;
  }, {});

  const handleCreate = async ({ title, participantIds, meetLink }) => {
    setCreating(true);
    await addMeeting({
      title,
      participants: participantIds,
      meet_link: meetLink,
    });
    setCreating(false);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mt-12">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Meetings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {myMeetings.length} meeting{myMeetings.length !== 1 ? 's' : ''} you are part of
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </button>
      </div>

      {myMeetings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Video className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No meetings yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Create a meeting or wait to be added to one
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myMeetings.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              userMap={userMap}
              canDelete={m.created_by === currentUser?.id}
              onDelete={deleteMeeting}
            />
          ))}
        </div>
      )}

      <CreateMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        users={users}
        creating={creating}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}