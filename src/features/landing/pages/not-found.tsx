import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

interface NotFoundPageProps {
	title?: string;
	description?: string;
}

export function NotFoundPage({
	title = "You're not on the guest list",
	description = "If you'd like to join, contact the host to be added.",
}: NotFoundPageProps = {}) {
	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-between gap-8 px-6 pt-20 pb-8 text-primary">
			<div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
				<h1 className="text-4xl leading-tight tracking-wide text-primary">{title}</h1>
				<p className="max-w-[320px] text-base leading-6 text-foreground/90">{description}</p>
			</div>
			<Button asChild size="lg" className="w-full">
				<Link to="/">Return home</Link>
			</Button>
		</main>
	);
}
