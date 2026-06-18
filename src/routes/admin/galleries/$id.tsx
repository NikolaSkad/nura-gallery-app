import { createFileRoute } from '@tanstack/react-router';
import { AdminGallery } from '@/features/admin/pages/admin-gallery';

export const Route = createFileRoute('/admin/galleries/$id')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	return <AdminGallery id={id} />;
}
