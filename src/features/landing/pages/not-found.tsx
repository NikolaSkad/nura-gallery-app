import { Link } from '@tanstack/react-router';

import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';

interface NotFoundProps {
	title?: string;
	description?: string;
}

export function NotFound({
	title = "You're not on the guest list",
	description = "If you'd like to join, contact the host to be added.",
}: NotFoundProps = {}) {
	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-between gap-8 px-6 pt-20 pb-8 text-primary">
			<div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
				<Title>{title}</Title>
				<p className="max-w-[320px] text-base leading-6 text-foreground/90">{description}</p>
			</div>
			<Button asChild size="lg" fullWidth>
				<Link to="/">Return home</Link>
			</Button>
		</main>
	);
}
