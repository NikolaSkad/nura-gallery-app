import { downloadZip } from 'client-zip';

import type { GalleryPhoto } from '@/features/guest-gallery/utils';

const MIME_TO_EXT: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/heic': 'heic',
	'image/gif': 'gif',
};

function extensionFor(mimeType: string): string {
	return MIME_TO_EXT[mimeType.toLowerCase()] ?? 'bin';
}

// Strip path separators and trim, so the zip's filename is safe on Win/macOS/Linux.
export function safeFileName(input: string): string {
	const trimmed = input
		.trim()
		.replace(/[\\/:*?"<>|]+/g, '-')
		.replace(/\s+/g, ' ');
	return trimmed.length > 0 ? trimmed : 'photos';
}

interface ZipPhoto {
	name: string;
	url: string;
}

// Trigger a save dialog for an in-memory blob. The anchor + object URL dance is
// what every "force download" pattern boils down to in browsers without
// File System Access API support.
function triggerBlobDownload(blob: Blob, fileName: string): void {
	const objectUrl = URL.createObjectURL(blob);
	try {
		const anchor = document.createElement('a');
		anchor.href = objectUrl;
		anchor.download = fileName;
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
	} finally {
		// Give the browser a tick to start the download before releasing the URL.
		setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
	}
}

interface DownloadSinglePhotoArgs {
	photo: GalleryPhoto;
	baseName: string;
	signal?: AbortSignal;
}

// Fetch a single photo and save it. Cross-origin Supabase URLs can't use
// `<a download>` directly because the browser ignores the attribute and
// navigates instead — fetching to a blob bypasses that.
export async function downloadSinglePhoto({
	photo,
	baseName,
	signal,
}: DownloadSinglePhotoArgs): Promise<void> {
	if (!photo.fullUrl) throw new Error('Photo is not ready to download');
	const response = await fetch(photo.fullUrl, { signal });
	if (!response.ok) throw new Error(`Failed to fetch photo (${response.status})`);
	const blob = await response.blob();
	const ext = extensionFor(photo.mimeType);
	triggerBlobDownload(blob, `${safeFileName(baseName)}.${ext}`);
}

export function preparePhotosForZip(photos: GalleryPhoto[]): ZipPhoto[] {
	const padWidth = String(photos.length).length;
	const result: ZipPhoto[] = [];
	let index = 0;
	for (const photo of photos) {
		if (!photo.fullUrl) continue;
		index++;
		const ext = extensionFor(photo.mimeType);
		const num = String(index).padStart(padWidth, '0');
		result.push({ name: `photo-${num}.${ext}`, url: photo.fullUrl });
	}
	return result;
}

interface DownloadArgs {
	photos: ZipPhoto[];
	zipName: string;
	onProgress?: (completed: number, total: number) => void;
	signal?: AbortSignal;
}

// Sequential fetch + stream into the zip. client-zip consumes each Response
// body lazily, so the full archive is built into the final Blob but source
// files aren't all in memory at once during construction.
export async function downloadPhotosAsZip({
	photos,
	zipName,
	onProgress,
	signal,
}: DownloadArgs): Promise<void> {
	if (photos.length === 0) throw new Error('No photos to download');

	let completed = 0;
	const total = photos.length;
	onProgress?.(completed, total);

	async function* iter() {
		for (const photo of photos) {
			if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
			const response = await fetch(photo.url, { signal });
			if (!response.ok) {
				throw new Error(`Failed to fetch ${photo.name} (${response.status})`);
			}
			yield { name: photo.name, input: response };
			completed++;
			onProgress?.(completed, total);
		}
	}

	const blob = await downloadZip(iter()).blob();
	if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

	triggerBlobDownload(blob, `${safeFileName(zipName)}.zip`);
}
