import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(gallery)/$token')({
	component: GuestLayout,
});

function GuestLayout() {
	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col">
			<Outlet />
		</div>
	);
}
