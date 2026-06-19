import { Link } from '@tanstack/react-router';

import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import type { Gallery } from '@/features/admin/api/galleries';
import { formatPhoneNumberDisplay } from '@/lib/format';

interface AdminGalleryCardProps {
	gallery: Gallery;
}

export function AdminGalleryCard({ gallery }: AdminGalleryCardProps) {
	const firstEventId = gallery.events[0]?.eventId;

	const content = (
		<>
			<CardTitle>{gallery.displayName}</CardTitle>
			<CardDescription>{formatPhoneNumberDisplay(gallery.phoneNumber)}</CardDescription>
		</>
	);

	if (!firstEventId) {
		return (
			<Card variant="glass" padding="sm">
				{content}
			</Card>
		);
	}

	return (
		<Card variant="glass" padding="sm" asChild>
			<Link
				className="w-full"
				to="/admin/galleries/$id/events/$eventId"
				params={{ id: gallery.id, eventId: firstEventId }}
			>
				{content}
			</Link>
		</Card>
	);
}
