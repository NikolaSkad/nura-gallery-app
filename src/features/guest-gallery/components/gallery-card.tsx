import { Link } from '@tanstack/react-router';

export function GalleryCard() {
	return (
		<Link
			className="flex w-full flex-col gap-0.5 rounded-[20px] p-3 bg-surface-glass backdrop-blur-md"
			to="/$token/events/$eventId"
			params={{ token: 'abc123', eventId: '1' }}
		>
			<h3 className="text-sm leading-5 text-primary">Event 1</h3>
			<p className="text-xs leading-[18px] text-primary">Friday 24 Oct, 18:00 - 21:00</p>
		</Link>
	);
}
