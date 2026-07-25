import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { postService } from "../services/postService";
import Loader from "../components/Loader";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    postService
      .getExplore(0)
      .then((data) => {
        setPosts(data.content);
        setHasMore(!data.last);
        setPage(0);
      })
      .finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const data = await postService.getExplore(page + 1);
      setPosts((prev) => [...prev, ...data.content]);
      setHasMore(!data.last);
      setPage((p) => p + 1);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) return <Loader label="Loading explore feed..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Explore</h1>
      {posts.length === 0 ? (
        <p className="text-sm text-gray-500">No posts yet. Be the first to share something!</p>
      ) : (
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:gap-2">
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`} className="group relative aspect-square overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.caption || "Post"}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
              <div className="absolute inset-0 hidden items-center justify-center gap-4 bg-black/40 text-white group-hover:flex">
                <span>❤️ {post.likeCount}</span>
                <span>💬 {post.commentCount}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button onClick={loadMore} disabled={loadingMore} className="btn-secondary">
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
