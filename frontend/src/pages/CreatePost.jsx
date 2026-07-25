import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postService } from "../services/postService";
import { extractErrorMessage } from "../services/api";
import ImageUploader from "../components/ImageUploader";

export default function CreatePost() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleFileSelected(selected) {
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Please choose an image first.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { url } = await postService.uploadImage(file);
      const post = await postService.create({ imageUrl: url, caption });
      navigate(`/post/${post.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-xl font-bold">Create a new post</h1>
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <ImageUploader onFileSelected={handleFileSelected} previewUrl={previewUrl} />
        <textarea
          placeholder="Write a caption..."
          className="input min-h-[100px] resize-y"
          maxLength={2200}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={submitting || !file} className="btn-primary w-full">
          {submitting ? "Sharing..." : "Share post"}
        </button>
      </form>
    </div>
  );
}
