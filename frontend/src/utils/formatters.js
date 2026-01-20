/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  if (!date) return '';

  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format a date for datetime-local input
 * @param {string|Date} date - Date to format
 * @returns {string} ISO-like format for datetime-local input
 */
export function formatDateTimeLocal(date) {
  if (!date) return '';

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '';

  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return formatDate(date);
}

/**
 * Get survey status based on dates
 * @param {string|Date|null} opensAt - Survey open date
 * @param {string|Date|null} closesAt - Survey close date
 * @returns {'scheduled'|'open'|'closed'} Survey status
 */
export function getSurveyStatus(opensAt, closesAt) {
  const now = new Date();

  if (opensAt && new Date(opensAt) > now) {
    return 'scheduled';
  }

  if (closesAt && new Date(closesAt) < now) {
    return 'closed';
  }

  return 'open';
}

/**
 * Get survey status badge color class
 * @param {'scheduled'|'open'|'closed'} status - Survey status
 * @returns {string} Tailwind CSS classes for the badge
 */
export function getStatusBadgeClass(status) {
  const classes = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    open: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return classes[status] || classes.open;
}
