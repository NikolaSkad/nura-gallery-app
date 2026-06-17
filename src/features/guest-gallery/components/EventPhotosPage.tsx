import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PhotoGrid } from '@/features/guest-gallery/components/PhotoGrid';

export function EventPhotosPage() {
	return (
		<div className="flex flex-1 flex-col gap-8 pb-8">
			<PageHeader
				rightContent={
					<Button variant="outline" size="sm">
						Download gallery
					</Button>
				}
			/>
			<div className="flex flex-col gap-10 px-3">
				<div className="flex flex-col gap-3">
					<h1 className="text-2xl text-primary">Event 1</h1>
					<p className="text-sm text-primary">Friday 24 Oct, 18:00 - 21:00</p>
				</div>
				<PhotoGrid />
			</div>
		</div>
	);
}
