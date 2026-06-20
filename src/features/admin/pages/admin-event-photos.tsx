import { useMemo } from 'react';
import { Page, PageMain } from '@/components/page';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { useAdminEvent } from '@/features/admin/api/events';
import { useAdminGalleryEventPhotos } from '@/features/admin/api/galleries';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { PhotoGrid } from '@/features/guest-gallery/components/photo-grid';
import { PhotoLightbox } from '@/features/guest-gallery/components/photo-lightbox';
import { usePhotoLightbox } from '@/features/guest-gallery/hooks/use-photo-lightbox';
import { formatEventDateTime } from '@/lib/format';

interface AdminEventPhotosProps {
	galleryId: string;
	eventId: string;
}

export function AdminEventPhotos({ galleryId, eventId }: AdminEventPhotosProps) {
	const photosQuery = useAdminGalleryEventPhotos(galleryId, eventId);
	const eventQuery = useAdminEvent(eventId);

	const photos = useMemo(() => photosQuery.data ?? [], [photosQuery.data]);
	const photoIds = useMemo(() => photos.map((p) => p.id), [photos]);
	const lightbox = usePhotoLightbox(photoIds);

	const event = eventQuery.data;
	const eventDateTime = event ? formatEventDateTime(event.startAt, event.endAt) : null;

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
					<Title>{event?.name ?? (eventQuery.isPending ? 'Loading…' : 'Event')}</Title>
					{eventDateTime ? (
						<p className="text-sm text-primary">
							{eventDateTime.date} | {eventDateTime.time}
						</p>
					) : null}
				</div>
				<div className="flex gap-2">
					<Button>Add photos</Button>
					<Button>Download all</Button>
				</div>
				{photosQuery.isPending ? (
					<p className="text-sm text-muted-foreground">Loading photos…</p>
				) : photosQuery.isError ? (
					<p className="text-sm text-destructive" role="alert">
						Couldn't load photos
					</p>
				) : photos.length === 0 ? (
					<p className="text-sm text-muted-foreground">No photos yet</p>
				) : (
					<PhotoGrid photos={photos} onOpen={lightbox.openImage} />
				)}
			</PageMain>
			<PhotoLightbox controller={lightbox} photos={photos}>
				<Button size="md">Download photo</Button>
			</PhotoLightbox>
		</Page>
	);
}
