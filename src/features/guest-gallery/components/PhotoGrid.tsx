import { PhotoCard } from '@/features/guest-gallery/components/PhotoCard';

const PHOTO_SLOTS = Array.from({ length: 15 }, () => crypto.randomUUID());

export function PhotoGrid() {
	return (
		<ul className="grid grid-cols-2 gap-2">
			{PHOTO_SLOTS.map((id) => (
				<li key={id}>
					<PhotoCard />
				</li>
			))}
		</ul>
	);
}
