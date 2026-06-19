import { useState } from 'react';
import { toast } from 'sonner';
import { Page, PageMain } from '@/components/page';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { useAdminGallery } from '@/features/admin/api/galleries';
import { AddEventSheet } from '@/features/admin/components/add-event-sheet';
import { AdminEventCard } from '@/features/admin/components/admin-event-card';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';

interface AdminGalleryEventsProps {
	id: string;
}

export function AdminGalleryEvents({ id }: AdminGalleryEventsProps) {
	const [addEventOpen, setAddEventOpen] = useState(false);
	const { data: gallery, isPending, isError } = useAdminGallery(id);

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
						{gallery.events.length === 0 ? (
							<p className="text-sm text-muted-foreground">No events yet</p>
						) : (
							<ul className="flex flex-col gap-2">
								{gallery.events.map((event) => (
									<li key={event.id}>
										<AdminEventCard galleryId={gallery.id} event={event} />
									</li>
								))}
							</ul>
						)}
					</>
				)}
			</PageMain>
			<AddEventSheet open={addEventOpen} onClose={() => setAddEventOpen(false)} />
		</Page>
	);
}
