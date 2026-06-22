import { useMemo, useRef } from 'react';
import { Page, PageMain } from '@/components/page';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { useAdminEvent } from '@/features/admin/api/events';
import { useAdminGalleryEventPhotos } from '@/features/admin/api/galleries';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { useUploadPhotos } from '@/features/admin/hooks/use-upload-photos';
import { PhotoGrid } from '@/features/guest-gallery/components/photo-grid';
import { PhotoLightbox } from '@/features/guest-gallery/components/photo-lightbox';
import { usePhotoLightbox } from '@/features/guest-gallery/hooks/use-photo-lightbox';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';
import { formatEventDateTime } from '@/lib/format';

interface AdminEventPhotosProps {
	galleryId: string;
	eventId: string;
}

export function AdminEventPhotos({ galleryId, eventId }: AdminEventPhotosProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const photosQuery = useAdminGalleryEventPhotos(galleryId, eventId);
	const eventQuery = useAdminEvent(eventId);

	const upload = useUploadPhotos({
		galleryId,
		eventId,
		onAllUploaded: () => {
			// Server-side photos are invalidated by the sync mutation; clear the
			// local pending list so they don't double-render once the query refetches.
			upload.reset();
		},
	});

	// Merge pending local photos with uploaded server photos. Pending first so
	// they read top-to-bottom as "newest at top".
	const photos = useMemo<GalleryPhoto[]>(() => {
		const uploaded = photosQuery.data ?? [];
		const pending: GalleryPhoto[] = upload.files.map((entry) => ({
			id: entry.id,
			fileKey: '',
			mimeType: entry.file.type,
			createdAt: '',
			localPreviewUrl: entry.localPreviewUrl,
		}));
		return [...pending, ...uploaded];
	}, [photosQuery.data, upload.files]);

	const photoIds = useMemo(() => photos.map((p) => p.id), [photos]);
	const lightbox = usePhotoLightbox(photoIds);

	const event = eventQuery.data;
	const eventDateTime = event ? formatEventDateTime(event.startAt, event.endAt) : null;

	const pickFiles = () => inputRef.current?.click();
	const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) upload.addFiles(e.target.files);
		// Reset native value so the same file can be re-picked after removal.
		e.target.value = '';
	};

	const hasPending = upload.files.length > 0;

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
				<input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
				<div className="flex gap-2">
					<Button onClick={pickFiles} disabled={upload.isUploading}>
						Add photos
					</Button>
					{hasPending ? (
						<Button
							onClick={() => upload.startUpload()}
							disabled={upload.uploadableCount === 0 || upload.isUploading}
						>
							{upload.isUploading ? 'Uploading…' : 'Upload photos'}
						</Button>
					) : (
						<Button>Download all</Button>
					)}
				</div>
				{photosQuery.isPending && !hasPending ? (
					<p className="text-sm text-muted-foreground">Loading photos…</p>
				) : photosQuery.isError ? (
					<p className="text-sm text-destructive" role="alert">
						Couldn't load photos
					</p>
				) : photos.length === 0 ? (
					<p className="text-sm text-muted-foreground">No photos yet</p>
				) : (
					<PhotoGrid photos={photos} onOpen={lightbox.openImage} onRemove={upload.removeFile} />
				)}
			</PageMain>
			<PhotoLightbox controller={lightbox} photos={photos}>
				<Button size="md">Download photo</Button>
			</PhotoLightbox>
		</Page>
	);
}
