import { useState } from "react";

export default function ShareButton({ postId }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/post/${postId}`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Check out this post on Snapgram", url: shareUrl });
        return;
      } catch {
        // user cancelled the native share sheet; fall through to clipboard copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", shareUrl);
    }
  }

  return (
    <button onClick={handleShare} className="flex items-center gap-1.5 text-sm font-medium">
      <span className="text-xl">📤</span>
      <span>{copied ? "Link copied!" : "Share"}</span>
    </button>
  );
}
