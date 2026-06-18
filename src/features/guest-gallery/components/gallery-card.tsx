import { Link } from '@tanstack/react-router';

import { Card, CardDescription, CardTitle } from '@/components/ui/card';

export function GalleryCard() {
	return (
		<Card variant="glass" padding="sm" asChild>
			<Link
				className="w-full"
				to="/$token/events/$eventId"
				params={{ token: 'abc123', eventId: '1' }}
			>
				<CardTitle>Event 1</CardTitle>
				<CardDescription>Friday 24 Oct, 18:00 - 21:00</CardDescription>
			</Link>
		</Card>
	);
}
