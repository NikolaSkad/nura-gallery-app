import { createFileRoute } from '@tanstack/react-router';
import { GalleryHomePage } from '@/features/guest-gallery/components/GalleryHomePage';

export const Route = createFileRoute('/(gallery)/$token/')({
	component: RouteComponent,
});

function RouteComponent() {
	return <GalleryHomePage />;
}
