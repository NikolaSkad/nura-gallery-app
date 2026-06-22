import { useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Page, PageMain } from '@/components/page';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAdminEvent } from '@/features/admin/api/events';
import { useAdminGalleryEventPhotos, useNotifyGallery } from '@/features/admin/api/galleries';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import {
	SelectActionBar,
	UploadActionBar,
} from '@/features/admin/components/event-photos-floating-bar';
import { useDownloadEventPhotos } from '@/features/admin/hooks/use-download-event-photos';
import { usePhotoSelectionMode } from '@/features/admin/hooks/use-photo-selection-mode';
import { useUploadPhotos } from '@/features/admin/hooks/use-upload-photos';
import { EventPhotosGridSection } from '@/features/guest-gallery/components/event-photos-grid-section';
import { EventPhotosHeading } from '@/features/guest-gallery/components/event-photos-heading';
import { PhotoLightbox } from '@/features/guest-gallery/components/photo-lightbox';
import { useEventPhotosViewer } from '@/features/guest-gallery/hooks/use-event-photos-viewer';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';

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
	const notifyGallery = useNotifyGallery();
	const downloader = useDownloadEventPhotos();

	const uploadedPhotos = photosQuery.data ?? [];
	const downloadableCount = uploadedPhotos.filter((p) => Boolean(p.fullUrl)).length;

	// Newest on top: pending (latest pick first) above uploaded (latest
	// createdAt first). ISO timestamps sort lexicographically.
	const basePhotos = useMemo<GalleryPhoto[]>(() => {
		const uploaded = (photosQuery.data ?? [])
			.slice()
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
		const pending: GalleryPhoto[] = upload.files
			.slice()
			.reverse()
			.map((entry) => ({
				id: entry.id,
				fileKey: '',
				mimeType: entry.file.type,
				createdAt: '',
				localPreviewUrl: entry.localPreviewUrl,
				isUploading: entry.status === 'uploading',
			}));
		return [...pending, ...uploaded];
	}, [photosQuery.data, upload.files]);

	const selection = usePhotoSelectionMode({ galleryId, eventId, photos: basePhotos });

	// Stamp deletingIds onto the rendered photos so each card shows the
	// per-photo overlay while its DELETE is in flight.
	const photos = useMemo(
		() => basePhotos.map((p) => (selection.deletingIds.has(p.id) ? { ...p, isDeleting: true } : p)),
		[basePhotos, selection.deletingIds],
	);

	const viewer = useEventPhotosViewer({ photos, eventName: eventQuery.data?.name });

	const handlePublish = async () => {
		if (notifyGallery.isPending) return;
		try {
			await notifyGallery.mutateAsync(galleryId);
			toast.success('Guest notified');
		} catch (err) {
			const message = err instanceof Error ? err.message : "Couldn't notify the guest";
			toast.error(message);
		}
	};

	const handleDownloadAll = () => {
		if (downloader.isDownloading) return;
		const eventName = eventQuery.data?.name;
		const zipName = eventName ? `${eventName} photos` : 'event photos';
		downloader.download({ photos: uploadedPhotos, zipName });
	};

	// Navigate away from the photo we're about to drop so the lightbox doesn't
	// auto-close (it does when the open id falls out of photoIds).
	const handleRemoveOpen = () => {
		if (!viewer.lightbox.openId) return;
		const removedId = viewer.lightbox.openId;
		if (viewer.lightbox.hasNext) viewer.lightbox.nextImage();
		else if (viewer.lightbox.hasPrev) viewer.lightbox.prevImage();
		else viewer.lightbox.closeImage();
		upload.removeFile(removedId);
	};

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
					<Button size="sm" onClick={handlePublish} disabled={notifyGallery.isPending}>
						{notifyGallery.isPending ? (
							<>
								<Spinner className="size-4" />
								Publishing…
							</>
						) : (
							'Publish'
						)}
					</Button>
				}
			/>
			<PageMain>
				<EventPhotosHeading
					name={eventQuery.data?.name}
					startAt={eventQuery.data?.startAt}
					endAt={eventQuery.data?.endAt}
					isLoading={eventQuery.isPending}
				/>
				<input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
				<div className="flex justify-between gap-2">
					<Button onClick={pickFiles} disabled={upload.isUploading}>
						Add photos
					</Button>
					<Button
						onClick={handleDownloadAll}
						disabled={downloader.isDownloading || downloadableCount === 0}
					>
						{downloader.isDownloading ? (
							<>
								<Spinner className="size-4" />
								{`Zipping… ${downloader.completed}/${downloader.total}`}
							</>
						) : (
							'Download all'
						)}
					</Button>
					<Button onClick={selection.selectAll}>Select all</Button>
				</div>
				<EventPhotosGridSection
					photos={photos}
					isLoading={photosQuery.isPending && !hasPending}
					isError={photosQuery.isError}
					onOpen={viewer.lightbox.openImage}
					onRemove={upload.removeFile}
					onDelete={selection.isSelecting ? undefined : selection.enterWith}
					selectedIds={selection.isSelecting ? selection.validSelectedIds : undefined}
					onToggleSelect={selection.isSelecting ? selection.toggle : undefined}
				/>
			</PageMain>
			{selection.isSelecting ? (
				<SelectActionBar selection={selection} />
			) : hasPending ? (
				<UploadActionBar upload={upload} />
			) : null}
			<PhotoLightbox controller={viewer.lightbox} photos={photos}>
				{viewer.isPendingOpen ? (
					<Button size="md" onClick={handleRemoveOpen}>
						Remove photo
					</Button>
				) : (
					<Button
						size="md"
						onClick={viewer.downloadOpen}
						disabled={viewer.isDownloadingOne || !viewer.openPhoto?.fullUrl}
					>
						{viewer.isDownloadingOne ? (
							<>
								<Spinner className="size-4" />
								Downloading…
							</>
						) : (
							'Download photo'
						)}
					</Button>
				)}
			</PhotoLightbox>
		</Page>
	);
}
