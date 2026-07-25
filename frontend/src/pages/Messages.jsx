import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { messageService } from "../services/messageService";
import Avatar from "../components/Avatar";
import Loader from "../components/Loader";

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messageService
      .getConversations()
      .then(setConversations)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading messages..." />;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Messages</h1>

      {conversations.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-500">
          <p className="mb-4">No conversations yet.</p>
          <p>
            Visit someone's profile and tap <strong>Message</strong> to start chatting.
          </p>
        </div>
      ) : (
        <ul className="card divide-y divide-gray-100 dark:divide-gray-800">
          {conversations.map((c) => (
            <li key={c.otherUser.username}>
              <Link
                to={`/messages/${c.otherUser.username}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <Avatar user={c.otherUser} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.otherUser.username}</p>
                  <p className="truncate text-sm text-gray-500">
                    {c.lastMessage.mine ? "You: " : ""}
                    {c.lastMessage.text || (c.lastMessage.imageUrl ? "📷 Photo" : "")}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{timeAgo(c.lastMessage.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
