import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { MeetingCard } from '../../components/meetings/MeetingCard';
import { CreateMeetingModal } from '../../components/meetings/CreateMeetingModal';

export default function Meetings() {
  const { currentUser, users } = useAuth();
  const { meetings, addMeeting } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async ({ title, participantIds }) => {
    setCreating(true);
    const newMeet = {
      title,
      participants: participantIds,
      meet_link: '#',
      createdAt: new Date().toISOString(),
    };
    await addMeeting(newMeet);
    setCreating(false);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mt-12">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Meetings
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Start Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map((m) => (
          <MeetingCard key={m.id} meeting={m} userMap={users.reduce((a,u)=>{a[u.id]=u.name;return a;}, {})} />
        ))}
      </div>

      <CreateMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        users={users}
        creating={creating}
      />
    </div>
  );
}
