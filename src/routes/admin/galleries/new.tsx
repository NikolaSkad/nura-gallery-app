import { createFileRoute } from '@tanstack/react-router';
import { CreateGallery } from '@/features/admin/pages/create-gallery';

export const Route = createFileRoute('/admin/galleries/new')({
	component: RouteComponent,
});

function RouteComponent() {
	return <CreateGallery />;
}
