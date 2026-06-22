import { PhotoCard } from '@/features/guest-gallery/components/photo-card';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';

interface PhotoGridProps {
	photos: GalleryPhoto[];
	onOpen: (id: string) => void;
	// When provided, pending photos (those with a localPreviewUrl) render an
	// X button that calls this. Uploaded server photos are never removable here.
	onRemove?: (id: string) => void;
}

export function PhotoGrid({ photos, onOpen, onRemove }: PhotoGridProps) {
	return (
		<ul className="grid grid-cols-2 gap-2">
			{photos.map((photo) => (
				<li key={photo.id}>
					<PhotoCard
						photo={photo}
						onOpen={onOpen}
						onRemove={
							onRemove && photo.localPreviewUrl && !photo.isUploading ? onRemove : undefined
						}
					/>
				</li>
			))}
		</ul>
	);
}
