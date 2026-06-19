import { createFileRoute } from '@tanstack/react-router';
import { AdminGalleryEvents } from '@/features/admin/pages/admin-gallery-events';

export const Route = createFileRoute('/admin/_authed/galleries/$id')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	return <AdminGalleryEvents id={id} />;
}
