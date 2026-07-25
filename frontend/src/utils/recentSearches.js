const MAX_ENTRIES = 8;

function storageKey(currentUsername) {
  return `recentSearches:${currentUsername || "guest"}`;
}

export function getRecentSearches(currentUsername) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(currentUsername))) || [];
  } catch {
    return [];
  }
}

export function addRecentSearch(currentUsername, user) {
  const existing = getRecentSearches(currentUsername).filter((u) => u.username !== user.username);
  const updated = [user, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(storageKey(currentUsername), JSON.stringify(updated));
  return updated;
}

export function removeRecentSearch(currentUsername, username) {
  const updated = getRecentSearches(currentUsername).filter((u) => u.username !== username);
  localStorage.setItem(storageKey(currentUsername), JSON.stringify(updated));
  return updated;
}

export function clearRecentSearches(currentUsername) {
  localStorage.removeItem(storageKey(currentUsername));
  return [];
}
