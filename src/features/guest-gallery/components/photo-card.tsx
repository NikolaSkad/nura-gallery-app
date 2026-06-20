import { type GalleryPhoto, getThumbnailUrl } from '@/features/guest-gallery/utils';

interface PhotoCardProps {
	photo: GalleryPhoto;
	onOpen: (id: string) => void;
}

export function PhotoCard({ photo, onOpen }: PhotoCardProps) {
	const thumbnail = getThumbnailUrl(photo.publicUrl);
	return (
		<button
			type="button"
			className="aspect-square w-full h-full overflow-hidden rounded-2xl bg-surface-glass backdrop-blur-md"
			onClick={() => onOpen(photo.id)}
		>
			{thumbnail ? (
				<img src={thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
			) : null}
		</button>
	);
}
