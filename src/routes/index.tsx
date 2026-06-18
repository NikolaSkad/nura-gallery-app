import { createFileRoute } from '@tanstack/react-router';
import { Home } from '@/features/landing/pages/home';

export const Route = createFileRoute('/')({
	component: RouteComponent,
});

function RouteComponent() {
	return <Home />;
}
