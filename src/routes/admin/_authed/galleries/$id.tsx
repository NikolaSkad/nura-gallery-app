import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_authed/galleries/$id')({
	component: () => <Outlet />,
});
