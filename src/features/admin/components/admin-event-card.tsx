import { Link } from '@tanstack/react-router';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import type { GalleryEvent } from '@/features/admin/api/galleries';

interface AdminEventCardProps {
	galleryId: string;
	event: GalleryEvent;
}

export function AdminEventCard({ galleryId, event }: AdminEventCardProps) {
	return (
		<Card variant="glass" padding="sm" asChild>
			<Link
				className="w-full"
				to="/admin/galleries/$id/events/$eventId"
				params={{ id: galleryId, eventId: event.eventId }}
			>
				<CardTitle>{event.displayName}</CardTitle>
				<CardDescription>
					{event.photoCount} {event.photoCount === 1 ? 'photo' : 'photos'}
				</CardDescription>
			</Link>
		</Card>
	);
}
