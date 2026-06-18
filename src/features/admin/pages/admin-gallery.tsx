import { Page, PageMain } from '@/components/page';
import { Title } from '@/components/title';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';

interface AdminGalleryProps {
	id: string;
}

export function AdminGallery({ id }: AdminGalleryProps) {
	return (
		<Page>
			<AdminPageHeader backTo="/admin" />
			<PageMain>
				<Title>Gallery</Title>
				<p className="text-sm text-muted-foreground">
					Admin gallery view for <span className="text-primary">{id}</span>. Header (back + copy
					link), shared <code>{'<GalleryList />'}</code>, and "Add Event" land here.
				</p>
			</PageMain>
		</Page>
	);
}
