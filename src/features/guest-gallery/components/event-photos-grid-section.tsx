import { PhotoGrid } from '@/features/guest-gallery/components/photo-grid';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';

interface EventPhotosGridSectionProps {
	photos: GalleryPhoto[];
	isLoading?: boolean;
	isError?: boolean;
	onOpen: (id: string) => void;
	onRemove?: (id: string) => void;
	onDelete?: (id: string) => void;
	selectedIds?: Set<string>;
	onToggleSelect?: (id: string) => void;
}

export function EventPhotosGridSection({
	photos,
	isLoading,
	isError,
	onOpen,
	onRemove,
	onDelete,
	selectedIds,
	onToggleSelect,
}: EventPhotosGridSectionProps) {
	if (isLoading) {
		return <p className="text-sm text-muted-foreground">Loading photos…</p>;
	}
	if (isError) {
		return (
			<p className="text-sm text-destructive" role="alert">
				Couldn't load photos
			</p>
		);
	}
	if (photos.length === 0) {
		return <p className="text-sm text-muted-foreground">No photos yet</p>;
	}
	return (
		<PhotoGrid
			photos={photos}
			onOpen={onOpen}
			onRemove={onRemove}
			onDelete={onDelete}
			selectedIds={selectedIds}
			onToggleSelect={onToggleSelect}
		/>
	);
}
