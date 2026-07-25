import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { commentService } from "../services/commentService";
import { extractErrorMessage } from "../services/api";
import Avatar from "./Avatar";

export default function CommentSection({ postId, onCommentCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    commentService
      .list(postId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const comment = await commentService.add(postId, text.trim());
      const updated = [...comments, comment];
      setComments(updated);
      onCommentCountChange?.(updated.length);
      setText("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId) {
    await commentService.remove(postId, commentId);
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    onCommentCountChange?.(updated.length);
  }

  return (
    <div className="space-y-3">
      {loading ? (
        <p className="text-sm text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet. Be the first to say something!</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-sm">
              <Avatar user={c.author} size="sm" />
              <div className="flex-1">
                <span className="font-semibold">{c.author.username}</span>{" "}
                <span>{c.text}</span>
              </div>
              {(c.author.username === user?.username) && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="input"
            maxLength={500}
          />
          <button type="submit" disabled={submitting || !text.trim()} className="btn-primary !px-3 !py-2">
            Post
          </button>
        </form>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
