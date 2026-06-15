import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Formats a given date string or Date object into the specified explicit timezone.
 * If no timezone is provided or it's invalid, it falls back to the local browser timezone.
 * 
 * @param date - The datetime string or Date object (usually from the backend, treated as UTC or absolute time).
 * @param tz - The IANA timezone string, e.g., 'Europe/Andorra'.
 * @param formatStr - The desired format string, e.g., 'MMMM D, YYYY h:mm A'.
 * @returns The formatted date string.
 */
export const formatInTimezone = (
    date: string | Date | undefined | null,
    formatStr: string,
    tz?: string | null
): string => {
    if (!date) return '';

    try {
        let dz = dayjs(date);

        if (tz) {
            // Apply the explicit timezone
            dz = dz.tz(tz);
        }

        return dz.format(formatStr);
    } catch (e) {
        console.error(`Error formatting date in timezone ${tz}:`, e);
        // Fallback to local formatting if the explicit timezone fails (e.g., unsupported timezone string)
        return dayjs(date).format(formatStr);
    }
};

/**
 * Parses a local date/time string as if it occurred in the given timezone, returning its absolute UTC ISO string.
 * Useful for handling forms where a user inputs "19:00" and it needs to be interpreted directly in the business's timezone.
 */
export const parseInTimezone = (
    localDateString: string,
    tz?: string | null
): string => {
    try {
        if (tz) {
            return dayjs.tz(localDateString, tz).toISOString();
        }
        return dayjs(localDateString).toISOString();
    } catch (e) {
        console.error(`Error parsing date in timezone ${tz}:`, e);
        return dayjs(localDateString).toISOString();
    }
};

export default dayjs;
