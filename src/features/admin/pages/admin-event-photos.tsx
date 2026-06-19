import { Page, PageMain } from '@/components/page';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { PhotoGrid } from '@/features/guest-gallery/components/photo-grid';
import { PhotoLightbox } from '@/features/guest-gallery/components/photo-lightbox';
import { usePhotoLightbox } from '@/features/guest-gallery/hooks/use-photo-lightbox';
import { PHOTO_IDS } from '@/features/guest-gallery/utils';

interface AdminEventPhotosProps {
	galleryId: string;
	eventId: string;
}

export function AdminEventPhotos({ galleryId, eventId: _eventId }: AdminEventPhotosProps) {
	const lightbox = usePhotoLightbox(PHOTO_IDS);

	return (
		<Page>
			<AdminPageHeader
				backTo={`/admin/galleries/${galleryId}`}
				rightContent={
					<div className="flex gap-2">
						<Button size="sm" className="flex-1">
							Publish
						</Button>
						<Button size="sm" className="flex-1">
							Delete gallery
						</Button>
					</div>
				}
			/>
			<PageMain>
				<div className="flex flex-col gap-3">
					<Title>Event 1</Title>
					<p className="text-sm text-primary">Friday 24 Oct, 18:00 - 21:00</p>
				</div>
				<div className="flex gap-2">
					<Button className="flex-1">Add photos</Button>
					<Button className="flex-1">Download all</Button>
				</div>
				<PhotoGrid onOpen={lightbox.openImage} />
			</PageMain>
			<PhotoLightbox controller={lightbox}>
				<Button size="md" className="w-fit">
					Download photo
				</Button>
			</PhotoLightbox>
		</Page>
	);
}
