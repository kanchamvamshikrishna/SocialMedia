import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { messageService } from "../services/messageService";
import { userService } from "../services/userService";
import { extractErrorMessage } from "../services/api";
import Avatar from "../components/Avatar";
import Loader from "../components/Loader";

const POLL_INTERVAL_MS = 4000;

export default function Conversation() {
  const { username } = useParams();
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    Promise.all([userService.getProfile(username), messageService.getThread(username)])
      .then(([profile, thread]) => {
        if (cancelled) return;
        setOtherUser(profile);
        setMessages(thread);
      })
      .finally(() => !cancelled && setLoading(false));

    const interval = setInterval(() => {
      messageService.getThread(username).then((thread) => !cancelled && setMessages(thread));
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError("");
    try {
      const message = await messageService.send(username, { text: text.trim() });
      setMessages((prev) => [...prev, message]);
      setText("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSending(true);
    setError("");
    try {
      const { url } = await messageService.uploadImage(file);
      const message = await messageService.send(username, { imageUrl: url });
      setMessages((prev) => [...prev, message]);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSending(false);
      e.target.value = "";
    }
  }

  if (loading) return <Loader label="Loading conversation..." />;

  return (
    <div className="mx-auto flex h-[calc(100vh-57px)] max-w-lg flex-col px-4 py-4">
      <div className="mb-2 flex items-center gap-3 border-b border-gray-200 pb-3 dark:border-gray-800">
        <Link to="/messages" className="text-lg sm:hidden">←</Link>
        {otherUser && (
          <Link to={`/profile/${otherUser.username}`} className="flex items-center gap-2">
            <Avatar user={otherUser} size="sm" />
            <span className="text-sm font-semibold">{otherUser.username}</span>
          </Link>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-2">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">
            Say hello to {otherUser?.username} 👋
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  m.mine
                    ? "bg-gradient-to-r from-brand-600 to-brand-400 text-white"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {m.imageUrl && (
                  <img src={m.imageUrl} alt="Shared" className="mb-1 max-h-60 rounded-lg object-cover" />
                )}
                {m.text && <p>{m.text}</p>}
                {m.mine && (
                  <p className={`mt-1 text-right text-[10px] ${m.seen ? "text-white/90" : "text-white/60"}`}>
                    {m.seen ? "Seen ✓✓" : "Delivered ✓"}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-800">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          className="text-xl"
          title="Send a photo"
        >
          📷
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePick}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message..."
          className="input"
          disabled={sending}
        />
        <button type="submit" disabled={sending || !text.trim()} className="btn-primary !px-3 !py-2">
          Send
        </button>
      </form>
    </div>
  );
}
