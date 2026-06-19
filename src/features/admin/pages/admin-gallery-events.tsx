import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Page, PageMain } from '@/components/page';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { useAdminGallery } from '@/features/admin/api/galleries';
import { AddEventSheet } from '@/features/admin/components/add-event-sheet';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { GalleryList } from '@/features/guest-gallery/components/gallery-list';
import type { GalleryEventItem } from '@/features/guest-gallery/utils';

interface AdminGalleryEventsProps {
	id: string;
}

export function AdminGalleryEvents({ id }: AdminGalleryEventsProps) {
	const [addEventOpen, setAddEventOpen] = useState(false);
	const { data: gallery, isPending, isError } = useAdminGallery(id);

	const events = useMemo<GalleryEventItem[]>(
		() =>
			gallery?.events.map((event) => ({
				id: event.eventId,
				title: event.displayName,
				description: `${event.photoCount} ${event.photoCount === 1 ? 'photo' : 'photos'}`,
			})) ?? [],
		[gallery],
	);

	const handleCopyLink = async () => {
		if (!gallery) return;
		const url = `${window.location.origin}/${gallery.token}`;
		try {
			await navigator.clipboard.writeText(url);
			toast.success('Gallery link copied');
		} catch {
			toast.error('Could not copy link');
		}
	};

	return (
		<Page>
			<AdminPageHeader
				backTo="/admin"
				rightContent={
					<Button
						variant="outline"
						size="sm"
						onClick={handleCopyLink}
						disabled={!gallery}
						className="w-fit"
					>
						Copy gallery link
					</Button>
				}
			/>
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
						<Button
							variant="outline"
							className="self-start w-fit"
							onClick={() => setAddEventOpen(true)}
						>
							Add event
						</Button>
						{events.length === 0 ? (
							<p className="text-sm text-muted-foreground">No events yet</p>
						) : (
							<GalleryList
								events={events}
								buildLink={(event) => ({
									to: '/admin/galleries/$id/events/$eventId',
									params: { id, eventId: event.id },
								})}
							/>
						)}
					</>
				)}
			</PageMain>
			<AddEventSheet open={addEventOpen} onClose={() => setAddEventOpen(false)} />
		</Page>
	);
}
