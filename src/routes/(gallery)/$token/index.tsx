import { createFileRoute } from '@tanstack/react-router';
import { GalleryHomePage } from '@/features/guest-gallery/pages/gallery-home';

export const Route = createFileRoute('/(gallery)/$token/')({
	component: RouteComponent,
});

function RouteComponent() {
	return <GalleryHomePage />;
}
