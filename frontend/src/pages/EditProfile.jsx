import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { extractErrorMessage } from "../services/api";
import Avatar from "../components/Avatar";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError("");
    try {
      const updated = await userService.uploadAvatar(file);
      updateUser(updated);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const updated = await userService.updateProfile({ fullName, bio });
      updateUser(updated);
      navigate(`/profile/${user.username}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-xl font-bold">Edit profile</h1>

      <div className="mb-6 flex items-center gap-4">
        <Avatar user={user} size="lg" />
        <label className="btn-secondary cursor-pointer">
          {uploadingAvatar ? "Uploading..." : "Change photo"}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={60} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea className="input min-h-[80px] resize-y" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={150} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
