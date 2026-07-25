import { Link } from "react-router-dom";
import Avatar from "./Avatar";

export default function UserListModal({ title, users, loading, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[70vh] w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            ✕
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {loading ? (
            <p className="p-4 text-center text-sm text-gray-500">Loading...</p>
          ) : users.length === 0 ? (
            <p className="p-4 text-center text-sm text-gray-500">No one here yet.</p>
          ) : (
            <ul>
              {users.map((u) => (
                <li key={u.id}>
                  <Link
                    to={`/profile/${u.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Avatar user={u} size="sm" />
                    <div>
                      <p className="text-sm font-semibold">{u.username}</p>
                      {u.fullName && <p className="text-xs text-gray-500">{u.fullName}</p>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
