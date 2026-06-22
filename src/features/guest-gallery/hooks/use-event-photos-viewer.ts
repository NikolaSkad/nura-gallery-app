import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { downloadSinglePhoto } from '@/features/admin/lib/download';
import {
	type PhotoLightboxController,
	usePhotoLightbox,
} from '@/features/guest-gallery/hooks/use-photo-lightbox';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';

interface UseEventPhotosViewerArgs {
	photos: GalleryPhoto[];
	eventName?: string;
}

export interface EventPhotosViewer {
	lightbox: PhotoLightboxController;
	openPhoto: GalleryPhoto | undefined;
	isPendingOpen: boolean;
	isDownloadingOne: boolean;
	downloadOpen: () => Promise<void>;
}

export function useEventPhotosViewer({
	photos,
	eventName,
}: UseEventPhotosViewerArgs): EventPhotosViewer {
	const photoIds = useMemo(() => photos.map((p) => p.id), [photos]);
	const lightbox = usePhotoLightbox(photoIds);

	const openPhoto = photos.find((p) => p.id === lightbox.openId);
	const isPendingOpen = Boolean(openPhoto?.localPreviewUrl);

	const [isDownloadingOne, setIsDownloadingOne] = useState(false);

	const downloadOpen = async () => {
		if (!openPhoto || isDownloadingOne) return;
		setIsDownloadingOne(true);
		try {
			const baseName = eventName ? `${eventName} - photo` : `photo-${openPhoto.id}`;
			await downloadSinglePhoto({ photo: openPhoto, baseName });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Couldn't download photo";
			toast.error(message);
		} finally {
			setIsDownloadingOne(false);
		}
	};

	return { lightbox, openPhoto, isPendingOpen, isDownloadingOne, downloadOpen };
}
