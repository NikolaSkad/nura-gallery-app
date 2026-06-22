import { CheckIcon, XIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';
import { cn } from '@/lib/utils';

interface PhotoCardProps {
	photo: GalleryPhoto;
	onOpen: (id: string) => void;
	// Pending photos only: X in the top-right that removes the local entry.
	onRemove?: (id: string) => void;
	// Uploaded photos only: checkbox in the top-left for multi-delete.
	isSelected?: boolean;
	onToggleSelect?: (id: string) => void;
}

export function PhotoCard({ photo, onOpen, onRemove, isSelected, onToggleSelect }: PhotoCardProps) {
	const thumbnail = photo.localPreviewUrl ?? photo.previewUrl;
	const isBusy = photo.isUploading || photo.isDeleting;
	return (
		<div className="relative aspect-square w-full">
			<button
				type="button"
				className="aspect-square h-full w-full overflow-hidden rounded-2xl bg-surface-glass backdrop-blur-md"
				onClick={() => onOpen(photo.id)}
				disabled={isBusy}
			>
				{thumbnail ? (
					<img
						src={thumbnail}
						alt=""
						loading="lazy"
						className={
							isBusy
								? 'h-full w-full object-cover opacity-50 blur-[2px]'
								: 'h-full w-full object-cover'
						}
					/>
				) : null}
			</button>
			{isBusy ? (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/40 backdrop-blur-sm">
					<Spinner className="size-8" />
				</div>
			) : null}
			{onToggleSelect && !isBusy ? (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onToggleSelect(photo.id);
					}}
					aria-label={isSelected ? 'Deselect photo' : 'Select photo'}
					aria-pressed={isSelected}
					className={cn(
						'absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-md border-2 transition-colors',
						isSelected
							? 'border-primary bg-primary text-primary-foreground'
							: 'border-foreground/70 bg-background/40 backdrop-blur-sm',
					)}
				>
					{isSelected ? <CheckIcon className="size-4" /> : null}
				</button>
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
