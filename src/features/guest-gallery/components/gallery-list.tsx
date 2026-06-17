import { GalleryCard } from '@/features/guest-gallery/components/gallery-card';

export function GalleryList() {
	return (
		<ul className="flex flex-col gap-2">
			<li>
				<GalleryCard />
			</li>
			<li>
				<GalleryCard />
			</li>
			<li>
				<GalleryCard />
			</li>
		</ul>
	);
}
