import { createFileRoute } from '@tanstack/react-router';
import { GalleryEvents } from '@/features/guest-gallery/pages/gallery-events';

export const Route = createFileRoute('/(gallery)/$token/')({
	component: RouteComponent,
});

function RouteComponent() {
	return <GalleryEvents />;
}
