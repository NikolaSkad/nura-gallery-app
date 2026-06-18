import { createFileRoute } from '@tanstack/react-router';
import { AdminLogin } from '@/features/admin/pages/admin-login';

export const Route = createFileRoute('/admin/login')({
	component: RouteComponent,
});

function RouteComponent() {
	return <AdminLogin />;
}
