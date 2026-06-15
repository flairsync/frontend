import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Formats a UTC date string to a specific timezone and format.
 * @param utcString - The UTC date string (ISO 8601).
 * @param businessTz - The business timezone (e.g., 'Europe/Paris').
 * @param formatStr - The dayjs format string (default: 'HH:mm').
 * @returns The formatted date string.
 */
export const formatInBusinessTimezone = (
  utcString: string | undefined | null,
  businessTz: string | undefined,
  formatStr: string = 'HH:mm'
): string => {
  if (!utcString) return '--:--';
  const tz = businessTz || 'UTC';
  return dayjs.utc(utcString).tz(tz).format(formatStr);
};

/**
 * Parses a local time string (HH:mm) and a reference date in a specific timezone
 * and returns the corresponding UTC ISO string.
 * Useful for updating check-in/out times.
 */
export const localTimeToUtcIso = (
  timeStr: string,
  referenceDateUtc: string,
  businessTz: string
): string => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const tz = businessTz || 'UTC';
  
  // Create dayjs object in the business timezone from the reference date
  let date = dayjs.utc(referenceDateUtc).tz(tz);
  
  // Update the time
  date = date.set('hour', hours).set('minute', minutes).set('second', 0).set('millisecond', 0);
  
  return date.toISOString();
};

export default dayjs;
