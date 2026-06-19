import { Link } from '@tanstack/react-router';

import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import type { Gallery } from '@/features/admin/api/galleries';
import { formatPhoneNumberDisplay } from '@/lib/format';

interface AdminGalleryCardProps {
	gallery: Gallery;
}

export function AdminGalleryCard({ gallery }: AdminGalleryCardProps) {
	return (
		<Card variant="glass" padding="sm" asChild>
			<Link className="w-full" to="/admin/galleries/$id" params={{ id: gallery.id }}>
				<CardTitle>{gallery.displayName}</CardTitle>
				<CardDescription>{formatPhoneNumberDisplay(gallery.phoneNumber)}</CardDescription>
			</Link>
		</Card>
	);
}
