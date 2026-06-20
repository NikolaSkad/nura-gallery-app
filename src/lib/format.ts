import dayjs, { type Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

// All Nura events live in NYC. The IANA name handles DST automatically — never
// hardcode -4/-5 or use `new Date()` for picker values.
export const VENUE_TZ = 'America/New_York';

/**
 * Real UTC ISO from BE → Dayjs anchored to NYC. The returned value's local
 * components (hour, minute, date) reflect NYC time, so date pickers and
 * display formatters render the venue's wall-clock regardless of the
 * viewer's browser timezone.
 */
export const fromUtcISO = (value: string): Dayjs => dayjs.utc(value).tz(VENUE_TZ);

/**
 * Formats ISO date string to readable format (e.g., "Fri, Oct 24").
 * BE returns real UTC; we read NYC components so the date matches the venue.
 */
export const formatEventDate = (dateString: string): string => {
	const str = fromUtcISO(dateString).format('ddd, MMM D');
	return str.replace(/\b[a-z]/g, (c) => c.toUpperCase());
};

/**
 * Formats a single time to am/pm format (e.g., "6pm" or "9:30am").
 * Reads NYC components from the underlying UTC instant.
 */
const formatTimeShort = (d: Dayjs): string => {
	const hours = d.hour();
	const minutes = d.minute();
	const ampm = hours >= 12 ? 'pm' : 'am';
	const hour12 = hours % 12 || 12;

	if (minutes === 0) {
		return `${hour12}${ampm}`;
	}
	return `${hour12}:${minutes.toString().padStart(2, '0')}${ampm}`;
};

/**
 * Formats event date and time. The date label uses the start day with weekday
 * (e.g., "Thu, May 14") even when the event crosses midnight; the time is a
 * plain range with no next-day suffix (e.g., "11pm - 2:30am").
 */
export const formatEventDateTime = (startAt: string, endAt: string) => {
	const start = fromUtcISO(startAt);
	const end = fromUtcISO(endAt);
	return {
		date: formatEventDate(startAt),
		time: `${formatTimeShort(start)} - ${formatTimeShort(end)}`,
	};
};

export const formatPhoneNumberDisplay = (phone: string): string => {
	if (!phone) return '';

	// US number (+1) X (XXX) XXX-XXXX
	if (phone.startsWith('+1')) {
		const digits = phone.replace(/^\+1/, '');
		if (digits.length === 10) {
			return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
		}
	}

	// UK number (+44) XXXX XXXX
	if (phone.startsWith('+44')) {
		const digits = phone.replace(/^\+44/, '');
		return `+44 ${digits.slice(0, 4)} ${digits.slice(4)}`;
	}

	// Other countries +XX XXX XXX XXXX
	const match = phone.match(/^(\+\d{1,4})(\d+)$/);
	if (match) {
		const [, countryCode, number] = match;
		const spacedNumber = number.replace(/(\d{3})/g, '$1 ').trim();
		return `${countryCode} ${spacedNumber}`;
	}

	return phone;
};
