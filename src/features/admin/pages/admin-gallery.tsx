import { useState } from 'react';

import GalleryIcon from '@/assets/gallery.svg?react';
import { Page, PageMain } from '@/components/page';
import { HeaderTitle } from '@/components/page-header';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { useAdminGalleries } from '@/features/admin/api/galleries';
import { AddEventSheet } from '@/features/admin/components/add-event-sheet';
import { AdminGalleryCard } from '@/features/admin/components/admin-gallery-card';
import { AdminGalleryListSkeleton } from '@/features/admin/components/admin-gallery-list-skeleton';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { CreateGallerySheet } from '@/features/admin/components/create-gallery-sheet';

export function AdminGallery() {
	const [createOpen, setCreateOpen] = useState(false);
	const [addEventOpen, setAddEventOpen] = useState(false);
	const { data: galleries, isPending, isError } = useAdminGalleries();

	return (
		<Page>
			<AdminPageHeader
				leftContent={<HeaderTitle icon={<GalleryIcon />}>Photo Gallery</HeaderTitle>}
			/>
			<PageMain>
				<Title size="sm">Guests List</Title>
				<div className="flex items-center justify-center gap-2">
					<Button className="flex-1" onClick={() => setCreateOpen(true)}>
						Add guest gallery
					</Button>
					<Button className="flex-1" onClick={() => setAddEventOpen(true)}>
						Add event
					</Button>
				</div>
				{isPending ? (
					<AdminGalleryListSkeleton />
				) : isError ? (
					<p className="text-sm text-destructive" role="alert">
						Couldn't load galleries
					</p>
				) : galleries.length === 0 ? (
					<p className="text-sm text-muted-foreground">No galleries yet</p>
				) : (
					<ul className="flex flex-col gap-2">
						{galleries.map((gallery) => (
							<li key={gallery.id}>
								<AdminGalleryCard gallery={gallery} />
							</li>
						))}
					</ul>
				)}
			</PageMain>
			<CreateGallerySheet open={createOpen} onClose={() => setCreateOpen(false)} />
			<AddEventSheet open={addEventOpen} onClose={() => setAddEventOpen(false)} />
		</Page>
	);
}
