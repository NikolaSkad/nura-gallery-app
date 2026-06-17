import GalleryIcon from '@/assets/gallery.svg?react';
import { HeaderTitle, PageHeader } from '@/components/page-header';
import { GalleryList } from '@/features/guest-gallery/components/GalleryList';

export function GalleryHomePage() {
	return (
		<div className="flex flex-1 flex-col gap-8 pb-8">
			<PageHeader leftContent={<HeaderTitle icon={<GalleryIcon />}>Photo Gallery</HeaderTitle>} />
			<main className="flex flex-col gap-8 px-3">
				<h1 className="text-2xl leading-8 text-primary">John Williams gallery</h1>
				<GalleryList />
			</main>
		</div>
	);
}
