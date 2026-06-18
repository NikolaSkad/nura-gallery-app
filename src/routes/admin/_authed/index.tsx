import { createFileRoute } from '@tanstack/react-router';

import { AdminHome } from '@/features/admin/pages/admin-home';

export const Route = createFileRoute('/admin/_authed/')({
	component: RouteComponent,
});

function RouteComponent() {
	return <AdminHome />;
}
