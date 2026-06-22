import { PhotoCard } from '@/features/guest-gallery/components/photo-card';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';

interface PhotoGridProps {
	photos: GalleryPhoto[];
	onOpen: (id: string) => void;
	// Pending photos only: X in the top-right.
	onRemove?: (id: string) => void;
	// Uploaded photos only: checkbox in the top-left for multi-delete.
	selectedIds?: Set<string>;
	onToggleSelect?: (id: string) => void;
}

export function PhotoGrid({
	photos,
	onOpen,
	onRemove,
	selectedIds,
	onToggleSelect,
}: PhotoGridProps) {
	return (
		<ul className="grid grid-cols-2 gap-2">
			{photos.map((photo) => {
				const isPending = Boolean(photo.localPreviewUrl);
				return (
					<li key={photo.id}>
						<PhotoCard
							photo={photo}
							onOpen={onOpen}
							// Pending: removable (X), not selectable.
							// Uploaded: selectable (checkbox), not removable here.
							onRemove={onRemove && isPending && !photo.isUploading ? onRemove : undefined}
							onToggleSelect={onToggleSelect && !isPending ? onToggleSelect : undefined}
							isSelected={selectedIds?.has(photo.id) ?? false}
						/>
					</li>
				);
			})}
		</ul>
	);
}
