import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../services/notificationService";
import Avatar from "../components/Avatar";
import Loader from "../components/Loader";

const TYPE_ICON = {
  LIKE: "❤️",
  COMMENT: "💬",
  FOLLOW: "👤",
  POST: "📸",
  MESSAGE: "✉️",
};

function describe(n) {
  switch (n.type) {
    case "LIKE":
      return "liked your post";
    case "COMMENT":
      return "commented on your post";
    case "FOLLOW":
      return "started following you";
    case "POST":
      return "shared a new post";
    case "MESSAGE":
      return "sent you a message";
    default:
      return "";
  }
}

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService
      .getAll()
      .then((data) => setNotifications(data.content))
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkAllRead() {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function handleClick(n) {
    if (!n.read) {
      notificationService.markRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
    if (n.type === "FOLLOW") {
      navigate(`/profile/${n.actor.username}`);
    } else if (n.type === "MESSAGE") {
      navigate(`/messages/${n.actor.username}`);
    } else if (n.postId) {
      navigate(`/post/${n.postId}`);
    }
  }

  if (loading) return <Loader label="Loading notifications..." />;

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Notifications</h1>
        {hasUnread && (
          <button onClick={handleMarkAllRead} className="text-xs text-brand-500 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">
          Nothing here yet. Likes, comments, follows, new posts, and messages will show up here.
        </p>
      ) : (
        <ul className="card divide-y divide-gray-100 dark:divide-gray-800">
          {notifications.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => handleClick(n)}
                className={`flex w-full items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-900 ${
                  n.read ? "" : "bg-brand-50 dark:bg-brand-500/10"
                }`}
              >
                <Avatar user={n.actor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-semibold">{n.actor.username}</span> {describe(n)}
                  </p>
                  <p className="text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
                </div>
                {n.postImageUrl ? (
                  <img src={n.postImageUrl} alt="Post" className="h-10 w-10 shrink-0 rounded object-cover" />
                ) : (
                  <span className="shrink-0 text-xl">{TYPE_ICON[n.type]}</span>
                )}
                {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
