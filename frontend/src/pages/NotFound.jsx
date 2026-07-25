import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="mb-2 text-3xl font-bold">404</h1>
      <p className="mb-6 text-sm text-gray-500">This page doesn't exist.</p>
      <Link to="/" className="btn-primary">
        Go home
      </Link>
    </div>
  );
}
