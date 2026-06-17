import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/features/landing/pages/home';

export const Route = createFileRoute('/')({
	component: RouteComponent,
});

function RouteComponent() {
	return <HomePage />;
}
