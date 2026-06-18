import { createFileRoute, redirect } from '@tanstack/react-router';

import { AdminLogin } from '@/features/admin/pages/admin-login';

export const Route = createFileRoute('/admin/login')({
	beforeLoad: ({ context }) => {
		if (context.auth.status === 'authed') {
			throw redirect({ to: '/admin' });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <AdminLogin />;
}
