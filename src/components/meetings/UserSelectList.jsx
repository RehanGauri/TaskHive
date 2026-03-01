export function UserSelectList({ users = [], selected = [], onChange }) {
  return (
    <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2">
      {users.length === 0 ? (
        <p className="text-sm text-gray-500">No users available</p>
      ) : (
        users.map((u) => (
          <label
            key={u.id}
            className="flex items-center gap-2 mb-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(u.id)}
              onChange={() => onChange(u.id)}
              className="form-checkbox h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {u.full_name || u.email || u.id}
            </span>
          </label>
        ))
      )}
    </div>
  );
}