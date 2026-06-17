import { createFileRoute } from '@tanstack/react-router';
import { EventPhotosPage } from '@/features/guest-gallery/components/EventPhotosPage';

export const Route = createFileRoute('/(gallery)/$token/events/$eventId')({
	component: RouteComponent,
});

function RouteComponent() {
	return <EventPhotosPage />;
}
