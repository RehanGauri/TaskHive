import { useAuth } from '../../context/AuthContext';

export default function Users() {
  const { users } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12">Users</h1>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {u.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{u.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
