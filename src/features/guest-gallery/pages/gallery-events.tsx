import { getRouteApi } from '@tanstack/react-router';
import { useMemo } from 'react';
import GalleryIcon from '@/assets/gallery.svg?react';
import { Page, PageMain } from '@/components/page';
import { HeaderTitle, PageHeader } from '@/components/page-header';
import { Title } from '@/components/title';
import { useGuestGallery } from '@/features/guest-gallery/api/galleries';
import { GalleryList } from '@/features/guest-gallery/components/gallery-list';
import type { GalleryEventItem } from '@/features/guest-gallery/utils';
import { formatEventDateTime } from '@/lib/format';

const route = getRouteApi('/(gallery)/$token/');

export function GalleryEvents() {
	const { token } = route.useParams();
	const { data: gallery, isPending, isError } = useGuestGallery(token);

	const events = useMemo<GalleryEventItem[]>(
		() =>
			gallery?.events.map((event) => {
				const dateTime =
					event.startAt && event.endAt ? formatEventDateTime(event.startAt, event.endAt) : null;
				const description = dateTime
					? `${dateTime.date}, ${dateTime.time}`
					: `${event.photoCount} ${event.photoCount === 1 ? 'photo' : 'photos'}`;
				return {
					id: event.eventId,
					title: event.displayName,
					description,
				};
			}) ?? [],
		[gallery],
	);

	return (
		<Page>
			<PageHeader leftContent={<HeaderTitle icon={<GalleryIcon />}>Photo Gallery</HeaderTitle>} />
			<PageMain>
				{isPending ? (
					<p className="text-sm text-muted-foreground">Loading…</p>
				) : isError || !gallery ? (
					<p className="text-sm text-destructive" role="alert">
						Couldn't load gallery
					</p>
				) : (
					<>
						<Title>{gallery.displayName}</Title>
						{events.length === 0 ? (
							<p className="text-sm text-muted-foreground">No events yet</p>
						) : (
							<GalleryList
								events={events}
								buildLink={(event) => ({
									to: '/$token/event/$eventId',
									params: { token, eventId: event.id },
								})}
							/>
						)}
					</>
				)}
			</PageMain>
		</Page>
	);
}
