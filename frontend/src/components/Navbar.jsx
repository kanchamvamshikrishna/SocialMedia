import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { userService } from "../services/userService";
import { notificationService } from "../services/notificationService";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from "../utils/recentSearches";
import Avatar from "./Avatar";

const UNREAD_POLL_INTERVAL_MS = 10000;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recent, setRecent] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    setRecent(getRecentSearches(user?.username));
  }, [user?.username]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    let cancelled = false;
    function poll() {
      notificationService.getUnreadCount().then((count) => !cancelled && setUnreadCount(count));
    }
    poll();
    const interval = setInterval(poll, UNREAD_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  function goToProfile(result) {
    setRecent(addRecentSearch(user?.username, result));
    setQuery("");
    setResults([]);
    setSearchFocused(false);
    setMobileMenuOpen(false);
    navigate(`/profile/${result.username}`);
  }

  function handleRemoveRecent(e, username) {
    e.stopPropagation();
    setRecent(removeRecentSearch(user?.username, username));
  }

  const showRecent = searchFocused && query.trim().length === 0 && recent.length > 0;
  const showResults = query.trim().length >= 2;

  const navLinks = user ? (
    <>
      <Link to="/" className="hover:text-brand-500" onClick={() => setMobileMenuOpen(false)}>Feed</Link>
      <Link to="/explore" className="hover:text-brand-500" onClick={() => setMobileMenuOpen(false)}>Explore</Link>
      <Link to="/create" className="hover:text-brand-500" onClick={() => setMobileMenuOpen(false)}>New post</Link>
      <Link to="/messages" className="hover:text-brand-500" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
      <Link
        to="/notifications"
        className="relative flex items-center gap-2 hover:text-brand-500"
        onClick={() => setMobileMenuOpen(false)}
      >
        <span>🔔 Notifications</span>
        {unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
      <button onClick={toggleTheme} className="text-left text-lg sm:text-center" title="Toggle theme">
        {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
      </button>
      <Link to={`/profile/${user.username}`} className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
        <Avatar user={user} size="sm" />
        <span className="sm:hidden">{user.username}</span>
      </Link>
      <button onClick={logout} className="btn-secondary !px-3 !py-1 text-left sm:text-center">
        Log out
      </button>
    </>
  ) : (
    <>
      <button onClick={toggleTheme} className="text-left text-lg sm:text-center" title="Toggle theme">
        {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
      </button>
      <Link to="/login" className="btn-secondary !px-3 !py-1" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
      <Link to="/register" className="btn-primary !px-3 !py-1" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-black/90">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link
          to="/"
          className="shrink-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 bg-clip-text text-xl font-bold text-transparent"
        >
          Snapgram
        </Link>

        {user && (
        <div ref={searchBoxRef} className="relative max-w-xs flex-1">
          <input
            value={query}
            onChange={handleSearch}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search people..."
            className="input"
          />
          {(showResults || showRecent) && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950">
              {showResults ? (
                <>
                  {searching && <div className="p-3 text-sm text-gray-500">Searching...</div>}
                  {!searching && results.length === 0 && (
                    <div className="p-3 text-sm text-gray-500">No users found</div>
                  )}
                  {results.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => goToProfile(r)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Avatar user={r} size="sm" />
                      <span>{r.username}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-semibold text-gray-500">Recent</span>
                    <button
                      onClick={() => setRecent(clearRecentSearches(user?.username))}
                      className="text-xs text-brand-500 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  {recent.map((r) => (
                    <button
                      key={r.username}
                      onClick={() => goToProfile(r)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        <Avatar user={r} size="sm" />
                        <span>{r.username}</span>
                      </span>
                      <span
                        onClick={(e) => handleRemoveRecent(e, r.username)}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        ✕
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        )}

        <nav className="ml-auto hidden items-center gap-4 text-sm font-medium sm:flex">
          {navLinks}
        </nav>

        <button
          className="ml-auto text-2xl sm:hidden"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 text-sm font-medium sm:hidden dark:border-gray-800">
          {navLinks}
        </nav>
      )}
    </header>
  );
}
