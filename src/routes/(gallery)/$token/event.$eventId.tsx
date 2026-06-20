import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { EventPhotos } from '@/features/guest-gallery/pages/event-photos';

const searchSchema = z.object({
	img: z.string().optional(),
});

export const Route = createFileRoute('/(gallery)/$token/event/$eventId')({
	component: RouteComponent,
	validateSearch: (search) => searchSchema.parse(search),
});

function RouteComponent() {
	return <EventPhotos />;
}
