import { getRouteApi } from '@tanstack/react-router';
import { useCallback } from 'react';
import ChevronLeft from '@/assets/left-chevron.svg?react';
import { PageHeader } from '@/components/page-header';
import { SheetPage } from '@/components/sheet-page';
import { Button } from '@/components/ui/button';
import { PhotoGrid } from '@/features/guest-gallery/components/photo-grid';
import { PHOTO_IDS } from '@/features/guest-gallery/utils';

const route = getRouteApi('/(gallery)/$token/events/$eventId');

export function EventPhotos() {
	const { token } = route.useParams();
	const { img } = route.useSearch();
	const navigate = route.useNavigate();

	const openImage = useCallback(
		(id: string) => {
			navigate({ search: (prev) => ({ ...prev, img: id }) });
		},
		[navigate],
	);

	const closeImage = useCallback(() => {
		navigate({ search: (prev) => ({ ...prev, img: undefined }) });
	}, [navigate]);

	const openId = img && PHOTO_IDS.includes(img) ? img : undefined;

	return (
		<div className="flex flex-1 flex-col gap-8 pb-8">
			<PageHeader
				rightContent={
					<Button variant="outline" size="sm">
						Download gallery
					</Button>
				}
				backTo={`/${token}`}
			/>
			<main className="flex flex-col gap-10 px-3">
				<div className="flex flex-col gap-3">
					<h1 className="text-2xl text-primary">Event 1</h1>
					<p className="text-sm text-primary">Friday 24 Oct, 18:00 - 21:00</p>
				</div>
				<PhotoGrid onOpen={openImage} />
			</main>
			<SheetPage open={Boolean(openId)} onClose={closeImage}>
				<div className="absolute top-1/2 left-1/2 flex w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 items-center justify-between">
					<Button variant="ghost" size="md">
						<ChevronLeft />
					</Button>
					<Button variant="ghost" size="md">
						<ChevronLeft className="rotate-180" />
					</Button>
				</div>
				<div className="flex flex-1 items-end justify-center">
					<Button size="sm">Download photo</Button>
				</div>
			</SheetPage>
		</div>
	);
}
