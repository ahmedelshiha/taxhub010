/**
 * Date Utilities
 * Helper functions for formatting dates across the application
 */

/**
 * Format a date to a readable string
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormat options
 */
export function formatDate(
    date: string | Date,
    options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
    }
): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-US", options).format(dateObj);
}

/**
 * Format a date relative to now (e.g., "2 days ago")
 */
export function formatRelativeDate(date: string | Date): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return "Invalid date";
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
    return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
}

/**
 * Format a date to ISO string for API requests
 */
export function formatDateForAPI(date: Date): string {
    return date.toISOString();
}

/**
 * Parse a date string safely
 */
export function parseDate(dateStr: string): Date | null {
    try {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}
