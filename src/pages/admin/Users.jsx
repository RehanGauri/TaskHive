import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

export default function Users() {
  const { currentUser, inviteUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.company_id) fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      // ✅ FIXED: added email to select so it shows in the list
      .select('id, full_name, email, role')
      .eq('company_id', currentUser.company_id);
    if (error) console.error('fetch users error', error);
    else setUsers(data || []);
    setLoading(false);
  };

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [formError, setFormError] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setFormError(null);
    setCreating(true);
    try {
      await inviteUser(newEmail, newName);
      setShowForm(false);
      setNewName('');
      setNewEmail('');
      fetchUsers();
    } catch (err) {
      console.error(err);
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // ✅ FIXED: safe initials that won't crash on null full_name
  const getInitials = (name) =>
    (name || '?')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mt-12">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Users</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Invite User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter((u) => u.role === 'admin').length}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter((u) => u.role === 'member').length}
          </p>
        </div>
      </div>

      {/* Invite form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Invite New User</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <input
              required
              placeholder="Full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              An invite email will be sent. They'll be added as a <strong>member</strong>.
            </p>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {creating ? 'Sending...' : 'Send Invite'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(null); }}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users list */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500">No users yet. Invite someone!</p>
        ) : (
          <ul className="space-y-3">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {getInitials(u.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{u.full_name || '—'}</p>
                  {/* ✅ FIXED: now shows email since it's in the query */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                  u.role === 'admin'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}