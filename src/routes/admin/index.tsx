import { createFileRoute } from '@tanstack/react-router';
import { AdminHome } from '@/features/admin/pages/admin-home';

export const Route = createFileRoute('/admin/')({
	component: RouteComponent,
});

function RouteComponent() {
	return <AdminHome />;
}
