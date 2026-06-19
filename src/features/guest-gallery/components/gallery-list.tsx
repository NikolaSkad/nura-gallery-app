import { Link } from '@tanstack/react-router';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import type { GalleryEventItem } from '@/features/guest-gallery/utils';

interface GalleryListProps {
	events: GalleryEventItem[];
	buildLink: (event: GalleryEventItem) => { to: string; params: Record<string, string> };
}

export function GalleryList({ events, buildLink }: GalleryListProps) {
	return (
		<ul className="flex flex-col gap-2">
			{events.map((event) => {
				const link = buildLink(event);
				return (
					<li key={event.id}>
						<Card variant="glass" padding="sm" asChild>
							<Link to={link.to} params={link.params} className="w-full">
								<CardTitle>{event.title}</CardTitle>
								<CardDescription>{event.description}</CardDescription>
							</Link>
						</Card>
					</li>
				);
			})}
		</ul>
	);
}
