import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
	type UploadUrlResponse,
	useRequestUploadUrls,
	useSyncPhotos,
} from '@/features/admin/api/galleries';
import {
	MAX_FILES_PER_BATCH,
	putWithProgress,
	runWithConcurrency,
	UPLOAD_CONCURRENCY,
	validateFile,
} from '@/features/admin/lib/upload';

// idle      — picked, waiting to upload
// invalid   — client-rejected (bad type / too big), can't retry, must remove
// uploading — in flight
// uploaded  — PUT done
// error     — network/server failure, can retry
export type UploadFileStatus = 'idle' | 'invalid' | 'uploading' | 'uploaded' | 'error';

export interface UploadFileEntry {
	id: string;
	file: File;
	// Blob URL for local preview. Only set for valid image files.
	localPreviewUrl?: string;
	status: UploadFileStatus;
	progress: number;
	error?: string;
}

interface UseUploadPhotosArgs {
	galleryId: string;
	eventId: string;
	onAllUploaded?: (count: number) => void;
}

function makeEntryId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface UseUploadPhotosResult {
	files: UploadFileEntry[];
	addFiles: (files: FileList | File[]) => void;
	removeFile: (id: string) => void;
	startUpload: () => Promise<void>;
	reset: () => void;
	isUploading: boolean;
	uploadableCount: number;
	uploadedCount: number;
	limit: number;
}

export function useUploadPhotos({
	galleryId,
	eventId,
	onAllUploaded,
}: UseUploadPhotosArgs): UseUploadPhotosResult {
	const [files, setFiles] = useState<UploadFileEntry[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	// Mirror of files for reading the latest state inside startUpload, which
	// runs across many async ticks.
	const filesRef = useRef(files);
	filesRef.current = files;

	const requestUrls = useRequestUploadUrls();
	const sync = useSyncPhotos();

	const updateEntry = useCallback((id: string, patch: Partial<UploadFileEntry>) => {
		setFiles((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
	}, []);

	const addFiles = useCallback((incoming: FileList | File[]) => {
		const list = Array.from(incoming);
		setFiles((prev) => {
			// Silently truncate if the user picks past the batch limit.
			const remaining = MAX_FILES_PER_BATCH - prev.length;
			if (remaining <= 0) return prev;
			const next: UploadFileEntry[] = [];
			for (const file of list.slice(0, remaining)) {
				const validation = validateFile(file);
				next.push({
					id: makeEntryId(),
					file,
					localPreviewUrl: validation.ok ? URL.createObjectURL(file) : undefined,
					status: validation.ok ? 'idle' : 'invalid',
					progress: 0,
					error: validation.ok ? undefined : validation.error,
				});
			}
			return [...prev, ...next];
		});
	}, []);

	const removeFile = useCallback((id: string) => {
		setFiles((prev) => {
			const target = prev.find((entry) => entry.id === id);
			if (target?.localPreviewUrl) URL.revokeObjectURL(target.localPreviewUrl);
			return prev.filter((entry) => entry.id !== id);
		});
	}, []);

	const reset = useCallback(() => {
		setFiles((prev) => {
			for (const entry of prev) {
				if (entry.localPreviewUrl) URL.revokeObjectURL(entry.localPreviewUrl);
			}
			return [];
		});
	}, []);

	// Release any remaining blob URLs on unmount.
	useEffect(() => {
		return () => {
			for (const entry of filesRef.current) {
				if (entry.localPreviewUrl) URL.revokeObjectURL(entry.localPreviewUrl);
			}
		};
	}, []);

	// Three steps: ask BE for presigned URLs, PUT each file in parallel, then
	// tell BE to sync. `invalid` entries are excluded — user must remove them.
	const startUpload = useCallback(async () => {
		const targets = filesRef.current.filter(
			(entry) => entry.status === 'idle' || entry.status === 'error',
		);
		if (targets.length === 0) return;

		setIsUploading(true);
		for (const entry of targets) {
			updateEntry(entry.id, { status: 'uploading', progress: 0, error: undefined });
		}

		// Step 1 — presign.
		let urls: UploadUrlResponse[];
		try {
			urls = await requestUrls.mutateAsync({
				galleryId,
				eventId,
				files: targets.map((entry) => ({
					fileName: entry.file.name,
					mimeType: entry.file.type,
				})),
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Could not get upload URLs';
			for (const entry of targets) {
				updateEntry(entry.id, { status: 'error', error: message, progress: 0 });
			}
			setIsUploading(false);
			return;
		}

		// Step 2 — PUT each file. BE returns URLs in the same order we asked.
		const tasks = targets.map((entry, index) => async () => {
			const url = urls[index]?.uploadUrl;
			if (!url) {
				updateEntry(entry.id, { status: 'error', error: 'Missing upload URL' });
				return;
			}
			try {
				await putWithProgress(entry.file, url, (percent) => {
					updateEntry(entry.id, { progress: percent });
				});
				updateEntry(entry.id, { status: 'uploaded', progress: 100 });
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Upload failed';
				updateEntry(entry.id, { status: 'error', error: message });
			}
		});

		await runWithConcurrency(tasks, UPLOAD_CONCURRENCY);

		// Step 3 — sync. Skip if every PUT failed.
		const anyUploaded = filesRef.current.some((entry) => entry.status === 'uploaded');
		if (anyUploaded) {
			try {
				const result = await sync.mutateAsync({ galleryId, eventId });
				onAllUploaded?.(result.synced);
			} catch {
				// Bytes are in storage but DB rows weren't created — flip back to
				// error so the next click retries. Re-PUT is safe; BE issues fresh
				// fileKeys on each presign.
				for (const entry of filesRef.current) {
					if (entry.status === 'uploaded') {
						updateEntry(entry.id, { status: 'error', error: 'Sync failed — try again' });
					}
				}
			}
		}

		setIsUploading(false);
	}, [eventId, galleryId, onAllUploaded, requestUrls, sync, updateEntry]);

	const counts = useMemo(() => {
		let uploadable = 0;
		let uploadedCount = 0;
		for (const entry of files) {
			if (entry.status === 'idle' || entry.status === 'error') uploadable++;
			else if (entry.status === 'uploaded') uploadedCount++;
		}
		return { uploadable, uploadedCount };
	}, [files]);

	return {
		files,
		addFiles,
		removeFile,
		startUpload,
		reset,
		isUploading,
		uploadableCount: counts.uploadable,
		uploadedCount: counts.uploadedCount,
		limit: MAX_FILES_PER_BATCH,
	};
}
