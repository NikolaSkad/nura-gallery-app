import { PhotoCard } from '@/features/guest-gallery/components/photo-card';
import { PHOTO_IDS } from '@/features/guest-gallery/utils';

interface PhotoGridProps {
	onOpen: (id: string) => void;
}

export function PhotoGrid({ onOpen }: PhotoGridProps) {
	return (
		<ul className="grid grid-cols-2 gap-2">
			{PHOTO_IDS.map((id) => (
				<li key={id}>
					<PhotoCard id={id} onOpen={onOpen} />
				</li>
			))}
		</ul>
	);
}
