import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { postService } from "../services/postService";
import PostCard from "../components/PostCard";
import Loader from "../components/Loader";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    postService
      .getFeed(0)
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
      const data = await postService.getFeed(page + 1);
      setPosts((prev) => [...prev, ...data.content]);
      setHasMore(!data.last);
      setPage((p) => p + 1);
    } finally {
      setLoadingMore(false);
    }
  }

  function handleDeleted(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return <Loader label="Loading your feed..." />;

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="mb-2 text-xl font-semibold">Your feed is empty</h2>
        <p className="mb-6 text-sm text-gray-500">
          Follow people from Explore, or share your first photo to get started.
        </p>
        <Link to="/explore" className="btn-primary">
          Discover people to follow
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDeleted={handleDeleted} />
      ))}
      {hasMore && (
        <div className="flex justify-center pb-8">
          <button onClick={loadMore} disabled={loadingMore} className="btn-secondary">
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
