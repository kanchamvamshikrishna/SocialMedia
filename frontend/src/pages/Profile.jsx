import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { postService } from "../services/postService";
import Avatar from "../components/Avatar";
import Loader from "../components/Loader";
import UserListModal from "../components/UserListModal";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [listModal, setListModal] = useState(null); // "followers" | "following" | null
  const [listUsers, setListUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    Promise.all([userService.getProfile(username), postService.getUserPosts(username)])
      .then(([profileData, postsData]) => {
        setProfile(profileData);
        setPosts(postsData.content);
      })
      .catch((err) => {
        // A 401 means the session dropped -- the api interceptor already
        // redirects to /login for that case, so don't also flash a
        // misleading "user not found" here. Only a real 404 means that.
        if (err?.response?.status !== 401) {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

  async function handleToggleFollow() {
    setFollowBusy(true);
    try {
      const result = await userService.toggleFollow(username);
      setProfile((p) => ({ ...p, followedByCurrentUser: result.following, followerCount: result.followerCount }));
    } finally {
      setFollowBusy(false);
    }
  }

  function openFollowers() {
    setListModal("followers");
    setListLoading(true);
    userService
      .getFollowers(username)
      .then(setListUsers)
      .finally(() => setListLoading(false));
  }

  function openFollowing() {
    setListModal("following");
    setListLoading(true);
    userService
      .getFollowing(username)
      .then(setListUsers)
      .finally(() => setListLoading(false));
  }

  if (loading) return <Loader label="Loading profile..." />;
  if (notFound || !profile) {
    return <p className="py-20 text-center text-sm text-gray-500">User not found.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Avatar user={profile} size="lg" />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <h1 className="text-xl font-semibold">{profile.username}</h1>
            {isOwnProfile ? (
              <Link to="/settings/profile" className="btn-secondary !px-3 !py-1 text-sm">
                Edit profile
              </Link>
            ) : (
              currentUser && (
                <>
                  <button
                    onClick={handleToggleFollow}
                    disabled={followBusy}
                    className={profile.followedByCurrentUser ? "btn-secondary !px-3 !py-1 text-sm" : "btn-primary !px-3 !py-1 text-sm"}
                  >
                    {profile.followedByCurrentUser ? "Following" : "Follow"}
                  </button>
                  <Link to={`/messages/${profile.username}`} className="btn-secondary !px-3 !py-1 text-sm">
                    Message
                  </Link>
                </>
              )
            )}
          </div>
          <div className="mt-3 flex justify-center gap-6 text-sm sm:justify-start">
            <span><strong>{profile.postCount}</strong> posts</span>
            <button onClick={openFollowers} className="hover:underline">
              <strong>{profile.followerCount}</strong> followers
            </button>
            <button onClick={openFollowing} className="hover:underline">
              <strong>{profile.followingCount}</strong> following
            </button>
          </div>
          {profile.fullName && <p className="mt-3 font-medium">{profile.fullName}</p>}
          {profile.bio && <p className="text-sm text-gray-600 dark:text-gray-400">{profile.bio}</p>}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:gap-2">
            {posts.map((post) => (
              <Link key={post.id} to={`/post/${post.id}`} className="aspect-square overflow-hidden">
                <img src={post.imageUrl} alt={post.caption || "Post"} className="h-full w-full object-cover" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {listModal && (
        <UserListModal
          title={listModal === "followers" ? "Followers" : "Following"}
          users={listUsers}
          loading={listLoading}
          onClose={() => setListModal(null)}
        />
      )}
    </div>
  );
}
