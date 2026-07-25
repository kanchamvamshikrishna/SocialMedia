import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { userService } from "../services/userService";
import Avatar from "./Avatar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch(e) {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await userService.search(value.trim());
      setResults(data);
    } finally {
      setSearching(false);
    }
  }

  function goToProfile(username) {
    setQuery("");
    setResults([]);
    navigate(`/profile/${username}`);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-black/90">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link
          to="/"
          className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 bg-clip-text text-xl font-bold text-transparent"
        >
          Snapgram
        </Link>

        <div className="relative flex-1 max-w-xs">
          <input
            value={query}
            onChange={handleSearch}
            placeholder="Search people..."
            className="input"
          />
          {query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950">
              {searching && <div className="p-3 text-sm text-gray-500">Searching...</div>}
              {!searching && results.length === 0 && (
                <div className="p-3 text-sm text-gray-500">No users found</div>
              )}
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => goToProfile(r.username)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Avatar user={r} size="sm" />
                  <span>{r.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="ml-auto flex items-center gap-3 text-sm font-medium">
          {user ? (
            <>
              <Link to="/" className="hover:text-brand-500">Feed</Link>
              <Link to="/explore" className="hover:text-brand-500">Explore</Link>
              <Link to="/create" className="hover:text-brand-500">New post</Link>
              <button onClick={toggleTheme} className="text-lg" title="Toggle theme">
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <Link to={`/profile/${user.username}`}>
                <Avatar user={user} size="sm" />
              </Link>
              <button onClick={logout} className="btn-secondary !px-3 !py-1">
                Log out
              </button>
            </>
          ) : (
            <>
              <button onClick={toggleTheme} className="text-lg" title="Toggle theme">
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <Link to="/login" className="btn-secondary !px-3 !py-1">Log in</Link>
              <Link to="/register" className="btn-primary !px-3 !py-1">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
