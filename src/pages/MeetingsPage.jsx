import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { MeetingCard } from '../components/meetings/MeetingCard';
import { CreateMeetingModal } from '../components/meetings/CreateMeetingModal';

export function MeetingsPage() {
  const { currentUser, loading, isAdmin } = useAuth(); // isAdmin now works correctly
  const user = currentUser;
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = '/login';
      } else {
        loadMeetings();
        if (isAdmin) loadUsers();
      }
    }
  }, [loading, user, isAdmin]);

  const loadMeetings = async () => {
    setFetching(true);
    setError('');
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .contains('participants', [user.id]);
    if (error) {
      setError(error.message);
    } else {
      setMeetings(data || []);
    }
    setFetching(false);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('id, email, first_name, last_name');
    if (!error) {
      // Normalize to have a full_name field
      const normalized = (data || []).map((u) => ({
        ...u,
        full_name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email,
      }));
      setUsers(normalized);
    }
  };

  const handleCreateMeeting = async ({ title, participantIds }) => {
    setCreating(true);
    setError('');
    try {
      // Correct way to call a Supabase Edge Function
      const { data: result, error: fnError } = await supabase.functions.invoke('createMeeting', {
        body: { title, participants: participantIds },
      });

      if (fnError) throw fnError;

      const meetLink = result?.meet_link;
      if (!meetLink) throw new Error('No meet link returned from function');

      const { error: insertErr } = await supabase.from('meetings').insert([
        {
          title,
          created_by: user.id,
          participants: participantIds,
          meet_link: meetLink,
        },
      ]);

      if (insertErr) throw insertErr;

      await loadMeetings();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to create meeting');
    }
    setCreating(false);
  };

  const userMap = users.reduce((acc, u) => {
    acc[u.id] = u.full_name || u.email || u.id;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Meetings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Schedule and join Google Meet sessions with your team.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Start Meeting
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {fetching ? (
        <p className="text-gray-500">Loading meetings...</p>
      ) : meetings.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          {isAdmin
            ? 'You have not created any meetings yet.'
            : 'No meetings scheduled for you.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((m) => (
            <MeetingCard key={m.id} meeting={m} userMap={userMap} />
          ))}
        </div>
      )}

      <CreateMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateMeeting}
        users={users}
        creating={creating}
      />
    </div>
  );
}