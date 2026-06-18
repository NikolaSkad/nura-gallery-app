import { createFileRoute, redirect } from '@tanstack/react-router';
import { Home } from '@/features/landing/pages/home';

export const Route = createFileRoute('/')({
	beforeLoad: ({ context }) => {
		if (context.auth.status === 'authed') {
			throw redirect({ to: '/admin' });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Home />;
}
