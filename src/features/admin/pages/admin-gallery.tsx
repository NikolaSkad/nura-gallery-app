import GalleryIcon from '@/assets/gallery.svg?react';
import { Page, PageMain } from '@/components/page';
import { HeaderTitle } from '@/components/page-header';
import { Title } from '@/components/title';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';

export function AdminGallery() {
	return (
		<Page>
			<AdminPageHeader
				leftContent={<HeaderTitle icon={<GalleryIcon />}>Photo Gallery</HeaderTitle>}
			/>
			<PageMain>
				<Title size="sm">Guests List</Title>
			</PageMain>
		</Page>
	);
}
