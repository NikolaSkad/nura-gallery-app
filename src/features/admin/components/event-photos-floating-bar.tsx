import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { PhotoSelectionMode } from '@/features/admin/hooks/use-photo-selection-mode';
import type { UseUploadPhotosResult } from '@/features/admin/hooks/use-upload-photos';

// Shared shell so both bars line up identically. pointer-events-none on the
// wrapper lets taps pass through the empty side rails to the photo grid
// behind.
function FloatingBarShell({ children }: { children: ReactNode }) {
	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-4 z-10 mx-auto flex w-full max-w-screen-sm justify-center gap-2 px-4">
			{children}
		</div>
	);
}

interface SelectActionBarProps {
	selection: PhotoSelectionMode;
}

export function SelectActionBar({ selection }: SelectActionBarProps) {
	return (
		<FloatingBarShell>
			<Button
				variant="outline"
				size="lg"
				onClick={selection.cancel}
				disabled={selection.isDeleting}
				className="pointer-events-auto"
			>
				Cancel
			</Button>
			<Button
				variant="filled"
				size="lg"
				onClick={selection.deleteSelected}
				disabled={selection.isDeleting || selection.validSelectedIds.size === 0}
				className="pointer-events-auto shadow-lg"
			>
				{selection.isDeleting ? (
					<>
						<Spinner className="size-4" />
						Deleting…
					</>
				) : (
					`Delete selected (${selection.validSelectedIds.size})`
				)}
			</Button>
		</FloatingBarShell>
	);
}

interface UploadActionBarProps {
	upload: UseUploadPhotosResult;
}

export function UploadActionBar({ upload }: UploadActionBarProps) {
	return (
		<FloatingBarShell>
			<Button
				variant="outline"
				size="lg"
				onClick={() => upload.reset()}
				disabled={upload.isUploading}
				className="pointer-events-auto"
			>
				Cancel
			</Button>
			<Button
				variant="filled"
				size="lg"
				onClick={() => upload.startUpload()}
				disabled={upload.uploadableCount === 0 || upload.isUploading}
				className="pointer-events-auto shadow-lg"
			>
				{upload.isUploading ? (
					<>
						<Spinner className="size-4" />
						Uploading…
					</>
				) : (
					`Upload photos (${upload.uploadableCount})`
				)}
			</Button>
		</FloatingBarShell>
	);
}
