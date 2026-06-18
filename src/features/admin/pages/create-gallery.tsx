import { Page, PageMain } from '@/components/page';
import { Title } from '@/components/title';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';

export function CreateGallery() {
	return (
		<Page>
			<AdminPageHeader backTo="/admin" />
			<PageMain>
				<Title>New gallery</Title>
				<p className="text-sm text-muted-foreground">
					Create-gallery placeholder. Phone + event selection form will live here.
				</p>
			</PageMain>
		</Page>
	);
}
