import type { ReactNode } from 'react';
import ChevronLeft from '@/assets/left-chevron.svg?react';
import { SheetPage } from '@/components/sheet-page';
import { Button } from '@/components/ui/button';
import type { PhotoLightboxController } from '@/features/guest-gallery/hooks/use-photo-lightbox';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';

interface PhotoLightboxProps {
	controller: PhotoLightboxController;
	photos: GalleryPhoto[];
	children?: ReactNode;
}

export function PhotoLightbox({ controller, photos, children }: PhotoLightboxProps) {
	const { openId, closeImage, prevImage, nextImage, hasPrev, hasNext } = controller;
	const current = photos.find((p) => p.id === openId);

	return (
		<SheetPage open={Boolean(openId)} onClose={closeImage}>
			{current?.publicUrl ? (
				<div className="absolute inset-0 flex items-center justify-center px-4">
					<img src={current.publicUrl} alt="" className="max-h-full max-w-full object-contain" />
				</div>
			) : null}
			<div className="absolute top-1/2 left-1/2 flex w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 items-center justify-between">
				<Button size="md" onClick={prevImage} disabled={!hasPrev}>
					<ChevronLeft />
				</Button>
				<Button size="md" onClick={nextImage} disabled={!hasNext}>
					<ChevronLeft className="rotate-180" />
				</Button>
			</div>
			<div className="flex flex-1 items-end justify-center">{children}</div>
		</SheetPage>
	);
}
