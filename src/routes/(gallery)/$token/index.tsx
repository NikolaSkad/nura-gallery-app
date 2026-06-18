import { createFileRoute } from '@tanstack/react-router';
import { GalleryHome } from '@/features/guest-gallery/pages/gallery-home';

export const Route = createFileRoute('/(gallery)/$token/')({
	component: RouteComponent,
});

function RouteComponent() {
	return <GalleryHome />;
}
