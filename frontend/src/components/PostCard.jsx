import { useState } from "react";
import { Link } from "react-router-dom";
import { postService } from "../services/postService";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import LikeButton from "./LikeButton";
import ShareButton from "./ShareButton";
import CommentSection from "./CommentSection";

export default function PostCard({ post, onDeleted, defaultShowComments = false }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [busy, setBusy] = useState(false);

  async function handleToggleLike() {
    if (!user) return;
    setBusy(true);
    try {
      const result = await postService.toggleLike(post.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    await postService.remove(post.id);
    onDeleted?.(post.id);
  }

  const isOwner = user?.username === post.author.username;

  return (
    <article className="card overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <Link to={`/profile/${post.author.username}`} className="flex items-center gap-2">
          <Avatar user={post.author} size="sm" />
          <span className="text-sm font-semibold">{post.author.username}</span>
        </Link>
        {isOwner && (
          <button onClick={handleDelete} className="text-xs text-gray-400 hover:text-red-500">
            Delete
          </button>
        )}
      </div>

      <img src={post.imageUrl} alt={post.caption || "Post image"} className="max-h-[32rem] w-full object-cover" />

      <div className="space-y-2 p-3">
        <div className="flex items-center gap-4">
          <LikeButton liked={liked} count={likeCount} onToggle={handleToggleLike} disabled={busy || !user} />
          <button onClick={() => setShowComments((v) => !v)} className="flex items-center gap-1.5 text-sm font-medium">
            <span className="text-xl">💬</span>
            <span>{commentCount}</span>
          </button>
          <ShareButton postId={post.id} />
        </div>

        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold">{post.author.username}</span> {post.caption}
          </p>
        )}

        {!showComments && commentCount > 0 && (
          <button onClick={() => setShowComments(true)} className="text-xs text-gray-500">
            View all {commentCount} comments
          </button>
        )}

        {showComments && (
          <div className="border-t border-gray-100 pt-2 dark:border-gray-800">
            <CommentSection postId={post.id} onCommentCountChange={setCommentCount} />
          </div>
        )}
      </div>
    </article>
  );
}
