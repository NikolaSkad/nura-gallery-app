import { PhotoCard } from '@/features/guest-gallery/components/photo-card';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';

interface PhotoGridProps {
	photos: GalleryPhoto[];
	onOpen: (id: string) => void;
}

export function PhotoGrid({ photos, onOpen }: PhotoGridProps) {
	return (
		<ul className="grid grid-cols-2 gap-2">
			{photos.map((photo) => (
				<li key={photo.id}>
					<PhotoCard photo={photo} onOpen={onOpen} />
				</li>
			))}
		</ul>
	);
}
