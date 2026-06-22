import { XIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';

interface PhotoCardProps {
	photo: GalleryPhoto;
	onOpen: (id: string) => void;
	// When provided, the card shows an X in the top-right and calls this on click.
	// Pass undefined for uploaded (server) photos so they stay non-removable.
	onRemove?: (id: string) => void;
}

export function PhotoCard({ photo, onOpen, onRemove }: PhotoCardProps) {
	// Pending photos use the blob preview; uploaded photos use the server thumb.
	const thumbnail = photo.localPreviewUrl ?? photo.previewUrl;
	return (
		<div className="relative aspect-square w-full">
			<button
				type="button"
				className="aspect-square h-full w-full overflow-hidden rounded-2xl bg-surface-glass backdrop-blur-md"
				onClick={() => onOpen(photo.id)}
			>
				{thumbnail ? (
					<img
						src={thumbnail}
						alt=""
						loading="lazy"
						className={
							photo.isUploading
								? 'h-full w-full object-cover opacity-50 blur-[2px]'
								: 'h-full w-full object-cover'
						}
					/>
				) : null}
			</button>
			{photo.isUploading ? (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/40 backdrop-blur-sm">
					<Spinner className="size-8" />
				</div>
			) : null}
			{onRemove ? (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onRemove(photo.id);
					}}
					aria-label="Remove photo"
					className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-colors hover:bg-background/90"
				>
					<XIcon className="size-4" />
				</button>
			) : null}
		</div>
	);
}
