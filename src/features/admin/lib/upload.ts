// Helpers for the admin photo upload. No React here — state lives in
// use-upload-photos.ts.

// TODO:(domain-confirm): BE plan says 50 files / 50MB. Move to shared config when BE exposes it.
export const MAX_FILES_PER_BATCH = 50;
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

// Browser's default parallel connection limit per origin.
export const UPLOAD_CONCURRENCY = 6;

export const ACCEPTED_MIME_PREFIX = 'image/';

export type FileValidation = { ok: true } | { ok: false; error: string };

// Quick client-side check before we bother the server. BE re-validates.
export function validateFile(file: File): FileValidation {
	if (!file.type.startsWith(ACCEPTED_MIME_PREFIX)) {
		return { ok: false, error: 'Unsupported file type' };
	}
	if (file.size > MAX_FILE_BYTES) {
		return { ok: false, error: 'File exceeds 50MB' };
	}
	return { ok: true };
}

// PUT a file to a presigned URL. Uses XHR because fetch can't report upload progress.
export function putWithProgress(
	file: File,
	url: string,
	onProgress: (percent: number) => void,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', url, true);
		xhr.setRequestHeader('Content-Type', file.type);

		xhr.upload.addEventListener('progress', (e) => {
			if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
		});

		xhr.addEventListener('load', () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				// Last progress event sometimes doesn't fire at 100 — pin it.
				onProgress(100);
				resolve();
			} else {
				reject(new Error(`Upload failed (${xhr.status})`));
			}
		});
		xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
		xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

		xhr.send(file);
	});
}

// Run tasks in parallel with a cap. Tasks handle their own errors — the catch
// here just keeps the worker alive after a failure.
export async function runWithConcurrency(
	tasks: Array<() => Promise<void>>,
	concurrency: number,
): Promise<void> {
	let next = 0;
	const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
		while (true) {
			const i = next++;
			if (i >= tasks.length) return;
			try {
				await tasks[i]();
			} catch {
				// Caller already recorded the failure in the entry.
			}
		}
	});
	await Promise.all(workers);
}
