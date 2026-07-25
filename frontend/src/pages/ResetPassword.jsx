import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";
import { extractErrorMessage } from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await authService.resetPassword({ token, newPassword });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <p className="text-sm text-red-500">
          Missing reset token. Please use the link from the forgot-password step.
        </p>
        <Link to="/forgot-password" className="mt-4 inline-block text-brand-500 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold">Set a new password</h1>
      {done ? (
        <p className="text-center text-sm text-green-600">
          Password updated! Redirecting you to log in...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <input
            required
            minLength={8}
            type="password"
            placeholder="New password"
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}
