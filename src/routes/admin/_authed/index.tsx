import { createFileRoute } from '@tanstack/react-router';

import { AdminGallery } from '@/features/admin/pages/admin-gallery';

export const Route = createFileRoute('/admin/_authed/')({
	component: RouteComponent,
});

function RouteComponent() {
	return <AdminGallery />;
}
