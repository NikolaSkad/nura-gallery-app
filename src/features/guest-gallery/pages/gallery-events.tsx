import { getRouteApi } from '@tanstack/react-router';
import GalleryIcon from '@/assets/gallery.svg?react';
import { Page, PageMain } from '@/components/page';
import { HeaderTitle, PageHeader } from '@/components/page-header';
import { Title } from '@/components/title';
import { GalleryList } from '@/features/guest-gallery/components/gallery-list';
import { MOCK_GALLERY_EVENTS, MOCK_GALLERY_NAME } from '@/features/guest-gallery/utils';

const route = getRouteApi('/(gallery)/$token/');

export function GalleryEvents() {
	const { token } = route.useParams();

	return (
		<Page>
			<PageHeader leftContent={<HeaderTitle icon={<GalleryIcon />}>Photo Gallery</HeaderTitle>} />
			<PageMain>
				<Title>{MOCK_GALLERY_NAME}</Title>
				<GalleryList
					events={MOCK_GALLERY_EVENTS}
					buildLink={(event) => ({
						to: '/$token/event/$eventId',
						params: { token, eventId: event.id },
					})}
				/>
			</PageMain>
		</Page>
	);
}
