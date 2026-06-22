import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Page, PageMain } from '@/components/page';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAdminEvent } from '@/features/admin/api/events';
import { useAdminGalleryEventPhotos, useDeletePhotos } from '@/features/admin/api/galleries';
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

	const [isSelecting, setIsSelecting] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
	const deletePhotos = useDeletePhotos();
	const isDeleting = deletingIds.size > 0;

	// Newest on top: pending (latest pick first) above uploaded (latest
	// createdAt first). ISO timestamps sort lexicographically.
	const photos = useMemo<GalleryPhoto[]>(() => {
		const uploaded = (photosQuery.data ?? [])
			.slice()
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
			.map((p) => (deletingIds.has(p.id) ? { ...p, isDeleting: true } : p));
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
	}, [photosQuery.data, upload.files, deletingIds]);

	const photoIds = useMemo(() => photos.map((p) => p.id), [photos]);
	const lightbox = usePhotoLightbox(photoIds);

	const event = eventQuery.data;
	const eventDateTime = event ? formatEventDateTime(event.startAt, event.endAt) : null;

	const openPhoto = photos.find((p) => p.id === lightbox.openId);
	const isPendingOpen = Boolean(openPhoto?.localPreviewUrl);

	// Navigate away from the photo we're about to drop so the lightbox doesn't
	// auto-close (it does when the open id falls out of photoIds).
	const handleRemoveOpen = () => {
		if (!lightbox.openId) return;
		const removedId = lightbox.openId;
		if (lightbox.hasNext) lightbox.nextImage();
		else if (lightbox.hasPrev) lightbox.prevImage();
		else lightbox.closeImage();
		upload.removeFile(removedId);
	};

	const pickFiles = () => inputRef.current?.click();
	const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) upload.addFiles(e.target.files);
		// Reset native value so the same file can be re-picked after removal.
		e.target.value = '';
	};

	const hasPending = upload.files.length > 0;

	// Drop selections for photos that no longer exist (after delete / refetch).
	const validSelectedIds = useMemo(() => {
		const ids = new Set<string>();
		for (const photo of photos) {
			if (!photo.localPreviewUrl && selectedIds.has(photo.id)) ids.add(photo.id);
		}
		return ids;
	}, [photos, selectedIds]);

	const toggleSelect = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	// Entry point from the per-photo "Delete photo" menu — enters multi-select
	// mode with this photo pre-selected, so a single-photo delete still uses
	// the same confirm-via-floating-button flow as a batch.
	const enterSelectModeWith = (id: string) => {
		setIsSelecting(true);
		setSelectedIds(new Set([id]));
	};

	const cancelSelectMode = () => {
		setIsSelecting(false);
		setSelectedIds(new Set());
	};

	const handleDeleteSelected = async () => {
		if (validSelectedIds.size === 0 || isDeleting) return;
		const ids = Array.from(validSelectedIds);
		setDeletingIds(new Set(ids));
		setSelectedIds(new Set());
		try {
			await deletePhotos.mutateAsync({ photoIds: ids, galleryId, eventId });
			setIsSelecting(false);
			toast.success(`Deleted ${ids.length} ${ids.length === 1 ? 'photo' : 'photos'}`);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Couldn't delete the selected photos";
			toast.error(message);
		} finally {
			// Photos either disappear via query invalidation (success) or stay
			// (failure). Either way the per-card overlay should clear.
			setDeletingIds(new Set());
		}
	};

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
					<Button>Download all</Button>
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
					<PhotoGrid
						photos={photos}
						onOpen={lightbox.openImage}
						onRemove={upload.removeFile}
						onDelete={isSelecting ? undefined : enterSelectModeWith}
						selectedIds={isSelecting ? validSelectedIds : undefined}
						onToggleSelect={isSelecting ? toggleSelect : undefined}
					/>
				)}
			</PageMain>
			{isSelecting ? (
				<div className="pointer-events-none fixed inset-x-0 bottom-4 z-10 mx-auto flex w-full max-w-screen-sm justify-center gap-2 px-4">
					<Button
						variant="outline"
						size="lg"
						onClick={cancelSelectMode}
						disabled={isDeleting}
						className="pointer-events-auto"
					>
						Cancel
					</Button>
					<Button
						variant="filled"
						size="lg"
						onClick={handleDeleteSelected}
						disabled={isDeleting || validSelectedIds.size === 0}
						className="pointer-events-auto shadow-lg"
					>
						{isDeleting ? (
							<>
								<Spinner className="size-4" />
								Deleting…
							</>
						) : (
							`Delete selected (${validSelectedIds.size})`
						)}
					</Button>
				</div>
			) : hasPending ? (
				<div className="pointer-events-none fixed inset-x-0 bottom-4 z-10 mx-auto flex w-full max-w-screen-sm justify-center gap-2 px-4">
					<Button
						variant="outline"
						size="lg"
						onClick={() => upload.reset()}
						disabled={upload.isUploading}
						className="pointer-events-auto"
					>
						Cancel
					</Button>
					<Button
						variant="filled"
						size="lg"
						onClick={() => upload.startUpload()}
						disabled={upload.uploadableCount === 0 || upload.isUploading}
						className="pointer-events-auto shadow-lg"
					>
						{upload.isUploading ? (
							<>
								<Spinner className="size-4" />
								Uploading…
							</>
						) : (
							`Upload photos (${upload.uploadableCount})`
						)}
					</Button>
				</div>
			) : null}
			<PhotoLightbox controller={lightbox} photos={photos}>
				{isPendingOpen ? (
					<Button size="md" onClick={handleRemoveOpen}>
						Remove photo
					</Button>
				) : (
					<Button size="md">Download photo</Button>
				)}
			</PhotoLightbox>
		</Page>
	);
}
