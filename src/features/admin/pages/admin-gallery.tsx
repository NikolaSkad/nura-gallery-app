import GalleryIcon from '@/assets/gallery.svg?react';
import { Page, PageMain } from '@/components/page';
import { HeaderTitle } from '@/components/page-header';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { GalleryCard } from '@/features/guest-gallery/components/gallery-card';

export function AdminGallery() {
	return (
		<Page>
			<AdminPageHeader
				leftContent={<HeaderTitle icon={<GalleryIcon />}>Photo Gallery</HeaderTitle>}
			/>
			<PageMain>
				<Title size="sm">Guests List</Title>
				<div className="flex justify-center items-center gap-2">
					<Button className="flex-1">Add guest gallery</Button>
					<Button className="flex-1">Add event</Button>
				</div>
				<div>
					<GalleryCard />
				</div>
			</PageMain>
		</Page>
	);
}
