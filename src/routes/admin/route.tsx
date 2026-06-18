import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/admin')({
	component: AdminLayout,
});

function AdminLayout() {
	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col">
			<main className="flex flex-1 flex-col">
				<Outlet />
			</main>
		</div>
	);
}
