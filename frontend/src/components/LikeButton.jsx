export default function LikeButton({ liked, count, onToggle, disabled }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"
    >
      <span className={`text-xl transition ${liked ? "scale-110" : ""}`}>
        {liked ? "❤️" : "🤍"}
      </span>
      <span>{count}</span>
    </button>
  );
}
