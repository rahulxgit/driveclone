/**
 * Format bytes to human-readable size string
 */
export const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

/**
 * Get initials from a full name (max 2 chars)
 */
export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase()).join('');

/**
 * Relative time string (e.g., "2 hours ago")
 */
export const timeAgo = (dateStr) => {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

/**
 * Truncate string to max length with ellipsis
 */
export const truncate = (str, max = 30) =>
  str?.length > max ? `${str.slice(0, max)}…` : str;

/**
 * Generate a pastel/vivid color from a string (folder name)
 */
export const colorFromString = (str = '') => {
  const colors = [
    '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
    '#10B981', '#F97316', '#EC4899', '#3B82F6',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
