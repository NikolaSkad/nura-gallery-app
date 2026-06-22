import { Maximize2Icon, MoreVerticalIcon, XIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';
import { cn } from '@/lib/utils';

interface PhotoCardProps {
	photo: GalleryPhoto;
	onOpen: (id: string) => void;
	// Pending photos only: X in the top-right that removes the local entry.
	onRemove?: (id: string) => void;
	// Uploaded photos, default mode: 3-dots dropdown in the top-right with a
	// "Delete photo" item. Clicking it is what enters multi-select mode.
	onDelete?: (id: string) => void;
	// Uploaded photos, select mode: checkbox in the top-left.
	isSelected?: boolean;
	onToggleSelect?: (id: string) => void;
}

export function PhotoCard({
	photo,
	onOpen,
	onRemove,
	onDelete,
	isSelected,
	onToggleSelect,
}: PhotoCardProps) {
	const thumbnail = photo.localPreviewUrl ?? photo.previewUrl;
	const isBusy = photo.isUploading || photo.isDeleting;
	const isPending = Boolean(photo.localPreviewUrl);
	return (
		<div className="relative aspect-square w-full">
			<button
				type="button"
				className={cn(
					'aspect-square h-full w-full overflow-hidden rounded-2xl bg-surface-glass backdrop-blur-md',
					isPending && 'border-2 border-primary',
				)}
				onClick={() => {
					// In select mode the whole card toggles selection — easier to
					// tap than the small checkbox.
					if (onToggleSelect) onToggleSelect(photo.id);
					else onOpen(photo.id);
				}}
				disabled={isBusy}
			>
				{thumbnail ? (
					<img
						src={thumbnail}
						alt=""
						loading="lazy"
						className={cn('h-full w-full object-cover', isBusy && 'opacity-50 blur-[2px]')}
					/>
				) : null}
			</button>
			{isBusy ? (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/40 backdrop-blur-sm">
					<Spinner className="size-8" />
				</div>
			) : null}
			{onToggleSelect && !isBusy ? (
				<>
					<Checkbox
						checked={isSelected}
						onCheckedChange={() => onToggleSelect(photo.id)}
						onClick={(e) => e.stopPropagation()}
						aria-label={isSelected ? 'Deselect photo' : 'Select photo'}
						className="absolute top-1.5 left-1.5 size-6 rounded-md border-2 border-primary bg-background/40 backdrop-blur-sm [&_svg]:size-4"
					/>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onOpen(photo.id);
						}}
						aria-label="Open preview"
						className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-background/70 text-primary backdrop-blur-sm transition-colors hover:bg-background/90"
					>
						<Maximize2Icon className="size-4" />
					</button>
				</>
			) : null}
			{onRemove ? (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onRemove(photo.id);
					}}
					aria-label="Remove photo"
					className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-background/70 text-primary backdrop-blur-sm transition-colors hover:bg-background/90"
				>
					<XIcon className="size-4" />
				</button>
			) : null}
			{onDelete && !isBusy ? (
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							onClick={(e) => e.stopPropagation()}
							aria-label="Photo options"
							className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-background/70 text-primary backdrop-blur-sm transition-colors hover:bg-background/90"
						>
							<MoreVerticalIcon className="size-4" />
						</button>
					</PopoverTrigger>
					<PopoverContent align="end" className="w-40 p-1">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(photo.id);
							}}
							className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-muted"
						>
							Delete photo
						</button>
					</PopoverContent>
				</Popover>
			) : null}
		</div>
	);
}
