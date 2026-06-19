import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AdminEventPhotos } from '@/features/admin/pages/admin-event-photos';

const searchSchema = z.object({
	img: z.string().optional(),
});

export const Route = createFileRoute('/admin/_authed/galleries/$id/events/$eventId')({
	component: RouteComponent,
	validateSearch: (search) => searchSchema.parse(search),
});

function RouteComponent() {
	const { id, eventId } = Route.useParams();
	return <AdminEventPhotos galleryId={id} eventId={eventId} />;
}
