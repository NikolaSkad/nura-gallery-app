import type { ReactNode } from 'react';
import ChevronLeft from '@/assets/left-chevron.svg?react';
import { SheetPage } from '@/components/sheet-page';
import { Button } from '@/components/ui/button';
import type { PhotoLightboxController } from '@/features/guest-gallery/hooks/use-photo-lightbox';

interface PhotoLightboxProps {
	controller: PhotoLightboxController;
	children?: ReactNode;
}

export function PhotoLightbox({ controller, children }: PhotoLightboxProps) {
	const { openId, closeImage, prevImage, nextImage, hasPrev, hasNext } = controller;

	return (
		<SheetPage open={Boolean(openId)} onClose={closeImage}>
			<div className="absolute top-1/2 left-1/2 flex w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 items-center justify-between">
				<Button size="md" onClick={prevImage} disabled={!hasPrev} className="w-fit">
					<ChevronLeft />
				</Button>
				<Button size="md" onClick={nextImage} disabled={!hasNext} className="w-fit">
					<ChevronLeft className="rotate-180" />
				</Button>
			</div>
			<div className="flex flex-1 items-end justify-center">{children}</div>
		</SheetPage>
	);
}
