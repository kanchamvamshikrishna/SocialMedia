export default function Avatar({ user, size = "md" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-24 w-24 text-2xl",
  };

  const initials = (user?.fullName || user?.username || "?").charAt(0).toUpperCase();

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.username}
        className={`${sizes[size]} rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-800`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-full bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 font-semibold text-white`}
    >
      {initials}
    </div>
  );
}
