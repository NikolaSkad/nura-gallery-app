import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_authed')({
	beforeLoad: ({ context }) => {
		if (context.auth.status !== 'authed') {
			throw redirect({ to: '/admin/login' });
		}
	},
	component: AuthedLayout,
});

function AuthedLayout() {
	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col">
			<Outlet />
		</div>
	);
}
