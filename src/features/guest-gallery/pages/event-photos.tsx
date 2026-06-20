import { getRouteApi } from '@tanstack/react-router';
import { Page, PageMain } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { PhotoGrid } from '@/features/guest-gallery/components/photo-grid';
import { PhotoLightbox } from '@/features/guest-gallery/components/photo-lightbox';
import { usePhotoLightbox } from '@/features/guest-gallery/hooks/use-photo-lightbox';
import { MOCK_GALLERY_PHOTOS } from '@/features/guest-gallery/utils';

const route = getRouteApi('/(gallery)/$token/event/$eventId');

export function EventPhotos() {
	const { token } = route.useParams();
	const photoIds = MOCK_GALLERY_PHOTOS.map((p) => p.id);
	const lightbox = usePhotoLightbox(photoIds);

	return (
		<Page>
			<PageHeader
				rightContent={
					<Button variant="outline" size="sm">
						Download gallery
					</Button>
				}
				backTo={`/${token}`}
			/>
			<PageMain>
				<div className="flex flex-col gap-3">
					<Title>Event 1</Title>
					<p className="text-sm text-primary">Friday 24 Oct, 18:00 - 21:00</p>
				</div>
				<PhotoGrid photos={MOCK_GALLERY_PHOTOS} onOpen={lightbox.openImage} />
			</PageMain>
			<PhotoLightbox controller={lightbox} photos={MOCK_GALLERY_PHOTOS}>
				<Button size="sm">Download photo</Button>
			</PhotoLightbox>
		</Page>
	);
}
