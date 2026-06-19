export function formatEventDateRange(startAt: string, endAt: string): string {
	const start = new Date(startAt);
	const end = new Date(endAt);
	const day = start.toLocaleDateString('en-US', { weekday: 'long' });
	const date = start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
	const time = (d: Date) =>
		d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
	return `${day} ${date}, ${time(start)} - ${time(end)}`;
}

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
