import { PhotoCard } from '@/features/guest-gallery/components/photo-card';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';

interface PhotoGridProps {
	photos: GalleryPhoto[];
	onOpen: (id: string) => void;
	// Pending photos: X in the top-right that removes the local entry.
	onRemove?: (id: string) => void;
	// Uploaded photos, default mode: 3-dots dropdown → "Delete photo".
	onDelete?: (id: string) => void;
	// Uploaded photos, select mode: checkbox in the top-left.
	selectedIds?: Set<string>;
	onToggleSelect?: (id: string) => void;
}

export function PhotoGrid({
	photos,
	onOpen,
	onRemove,
	onDelete,
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
							// Pending: removable (X), no menu / no checkbox.
							onRemove={onRemove && isPending && !photo.isUploading ? onRemove : undefined}
							// Uploaded out of select mode: dropdown.
							onDelete={onDelete && !isPending && !onToggleSelect ? onDelete : undefined}
							// Uploaded in select mode: checkbox.
							onToggleSelect={onToggleSelect && !isPending ? onToggleSelect : undefined}
							isSelected={selectedIds?.has(photo.id) ?? false}
						/>
					</li>
				);
			})}
		</ul>
	);
}
