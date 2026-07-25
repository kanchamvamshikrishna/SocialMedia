import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { postService } from "../services/postService";
import PostCard from "../components/PostCard";
import Loader from "../components/Loader";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    postService
      .getById(id)
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading post..." />;
  if (notFound || !post) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-sm text-gray-500">This post doesn't exist or was removed.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <PostCard post={{ ...post }} onDeleted={() => navigate("/explore")} defaultShowComments />
    </div>
  );
}
