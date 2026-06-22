import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useDeletePhotos } from '@/features/admin/api/galleries';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';

interface UsePhotoSelectionModeArgs {
	galleryId: string;
	eventId: string;
	photos: GalleryPhoto[];
}

export interface PhotoSelectionMode {
	isSelecting: boolean;
	validSelectedIds: Set<string>;
	deletingIds: Set<string>;
	isDeleting: boolean;
	toggle: (id: string) => void;
	enterWith: (id: string) => void;
	cancel: () => void;
	selectAll: () => void;
	deleteSelected: () => Promise<void>;
}

export function usePhotoSelectionMode({
	galleryId,
	eventId,
	photos,
}: UsePhotoSelectionModeArgs): PhotoSelectionMode {
	const [isSelecting, setIsSelecting] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
	const deletePhotos = useDeletePhotos();
	const isDeleting = deletingIds.size > 0;

	// Drop selections for photos that no longer exist (after delete / refetch)
	// and any pending entries that snuck in via enterWith races.
	const validSelectedIds = useMemo(() => {
		const ids = new Set<string>();
		for (const photo of photos) {
			if (!photo.localPreviewUrl && selectedIds.has(photo.id)) ids.add(photo.id);
		}
		return ids;
	}, [photos, selectedIds]);

	const toggle = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	// Entry point from the per-photo "Delete photo" menu — enters multi-select
	// mode with this photo pre-selected.
	const enterWith = (id: string) => {
		setIsSelecting(true);
		setSelectedIds(new Set([id]));
	};

	const cancel = () => {
		setIsSelecting(false);
		setSelectedIds(new Set());
	};

	const selectAll = () => {
		const selectableIds = photos.filter((p) => !p.localPreviewUrl).map((p) => p.id);
		if (selectableIds.length === 0) return;
		setIsSelecting(true);
		setSelectedIds(new Set(selectableIds));
	};

	const deleteSelected = async () => {
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

	return {
		isSelecting,
		validSelectedIds,
		deletingIds,
		isDeleting,
		toggle,
		enterWith,
		cancel,
		selectAll,
		deleteSelected,
	};
}
