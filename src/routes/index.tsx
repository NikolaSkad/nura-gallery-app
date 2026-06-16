import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
	component: HomePage,
});

function HomePage() {
	return (
		<main className="flex min-h-full items-center justify-center">
			<h1 className="text-2xl font-medium text-neutral-800">Nura Gallery</h1>
			<Button variant="filled">Test Button</Button>
		</main>
	);
}
