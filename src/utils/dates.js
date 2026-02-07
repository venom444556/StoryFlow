import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';

/**
 * Ensure we are working with a Date object.
 * Accepts Date instances, ISO strings, and timestamps.
 */
const toDate = (value) => {
  if (value instanceof Date) return value;
  if (typeof value === 'string') return parseISO(value);
  if (typeof value === 'number') return new Date(value);
  return new Date(value);
};

/**
 * Format a date as "Jan 5, 2026".
 * @param {Date|string|number} date
 * @returns {string}
 */
export const formatDate = (date) => format(toDate(date), 'MMM d, yyyy');

/**
 * Format a date as "Jan 5, 2026 3:45 PM".
 * @param {Date|string|number} date
 * @returns {string}
 */
export const formatDateTime = (date) => format(toDate(date), 'MMM d, yyyy h:mm a');

/**
 * Return a human-readable relative time string (e.g. "2 hours ago").
 * @param {Date|string|number} date
 * @returns {string}
 */
export const formatRelative = (date) =>
  formatDistanceToNow(toDate(date), { addSuffix: true });

/**
 * Format a date as a short label, e.g. "Jan 5".
 * @param {Date|string|number} date
 * @returns {string}
 */
export const formatShortDate = (date) => format(toDate(date), 'MMM d');

/**
 * Check whether a date is in the past (overdue).
 * @param {Date|string|number} date
 * @returns {boolean}
 */
export const isOverdue = (date) => isPast(toDate(date));

/**
 * Safely convert a value to an ISO 8601 string.
 * @param {Date|string|number} date
 * @returns {string}
 */
export const toISOString = (date) => toDate(date).toISOString();
