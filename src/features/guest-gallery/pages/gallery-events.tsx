import GalleryIcon from '@/assets/gallery.svg?react';
import { Page, PageMain } from '@/components/page';
import { HeaderTitle, PageHeader } from '@/components/page-header';
import { Title } from '@/components/title';
import { GalleryList } from '@/features/guest-gallery/components/gallery-list';

export function GalleryEvents() {
	return (
		<Page>
			<PageHeader leftContent={<HeaderTitle icon={<GalleryIcon />}>Photo Gallery</HeaderTitle>} />
			<PageMain>
				<Title>John Williams gallery</Title>
				<GalleryList />
			</PageMain>
		</Page>
	);
}
