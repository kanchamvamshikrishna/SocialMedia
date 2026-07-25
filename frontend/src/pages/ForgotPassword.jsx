import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import { extractErrorMessage } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const data = await authService.forgotPassword(email);
      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-bold">Forgot your password?</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Enter your email and we'll generate a reset link.
      </p>
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <input
          required
          type="email"
          placeholder="you@example.com"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      {result && (
        <div className="mt-4 space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-700 dark:bg-amber-900/20">
          <p>{result.message}</p>
          {result.devResetLink && (
            <>
              <p className="font-medium">Dev mode — no email provider is configured, so here's your link:</p>
              <Link to={result.devResetLink.replace(window.location.origin, "")} className="break-all text-brand-500 underline">
                {result.devResetLink}
              </Link>
            </>
          )}
        </div>
      )}

      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-brand-500 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
