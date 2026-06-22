import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { downloadPhotosAsZip, preparePhotosForZip } from '@/features/admin/lib/download';
import type { GalleryPhoto } from '@/features/guest-gallery/utils';

interface DownloadArgs {
	photos: GalleryPhoto[];
	zipName: string;
}

export interface UseDownloadEventPhotosResult {
	download: (args: DownloadArgs) => Promise<void>;
	cancel: () => void;
	isDownloading: boolean;
	completed: number;
	total: number;
}

export function useDownloadEventPhotos(): UseDownloadEventPhotosResult {
	const [isDownloading, setIsDownloading] = useState(false);
	const [completed, setCompleted] = useState(0);
	const [total, setTotal] = useState(0);
	const abortRef = useRef<AbortController | null>(null);

	// Abort any in-flight zip on unmount so navigating away doesn't leak fetches.
	useEffect(() => {
		return () => abortRef.current?.abort();
	}, []);

	// Warn before refresh / tab-close while a zip is being built — the in-memory
	// blob and pending fetches don't survive a reload, so an accidental refresh
	// loses minutes of work.
	useEffect(() => {
		if (!isDownloading) return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			// Legacy browsers required a returnValue assignment to show the prompt.
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	}, [isDownloading]);

	const cancel = useCallback(() => {
		abortRef.current?.abort();
	}, []);

	const download = useCallback(async ({ photos, zipName }: DownloadArgs) => {
		const ready = preparePhotosForZip(photos);
		if (ready.length === 0) {
			toast.error('No photos to download yet');
			return;
		}

		// Replace any previous controller (e.g. retry after error).
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setIsDownloading(true);
		setCompleted(0);
		setTotal(ready.length);

		try {
			await downloadPhotosAsZip({
				photos: ready,
				zipName,
				signal: controller.signal,
				onProgress: (done) => setCompleted(done),
			});
			toast.success(`Downloaded ${ready.length} ${ready.length === 1 ? 'photo' : 'photos'}`);
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') {
				// Silent — user cancelled or navigated away.
				return;
			}
			const message = err instanceof Error ? err.message : "Couldn't download photos";
			toast.error(message);
		} finally {
			setIsDownloading(false);
			abortRef.current = null;
		}
	}, []);

	return { download, cancel, isDownloading, completed, total };
}
