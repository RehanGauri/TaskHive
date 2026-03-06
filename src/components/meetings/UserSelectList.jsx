export function UserSelectList({ users = [], selected = [], onChange }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Participants
      </p>
      <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
        {users.length === 0 ? (
          <p className="text-sm text-gray-500 p-2">No users available</p>
        ) : (
          users.map((u) => (
            <label
              key={u.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(u.id)}
                onChange={() => onChange(u.id)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
              />
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium shrink-0">
                {(u.full_name || u.name || u.email || '?')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {u.full_name || u.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
              </div>
            </label>
          ))
        )}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          {selected.length} participant{selected.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}