import { clearPersistedTokens, readAccessToken } from '@/lib/auth/storage';

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

export class ApiError extends Error {
	status: number;
	body: unknown;

	constructor(status: number, message: string, body: unknown) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.body = body;
	}
}

/**
 * Registered by AuthProvider on mount. Called by adminFetch on 401 so the
 * provider can flip its state to `anon`, which causes the router context to
 * change and the `/admin/*` boundary to redirect to `/admin/login`.
 */
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: (() => void) | null): void {
	onUnauthorized = cb;
}

interface AdminFetchOptions extends Omit<RequestInit, 'body'> {
	body?: unknown;
}

export async function adminFetch<T = unknown>(
	path: string,
	options: AdminFetchOptions = {},
): Promise<T> {
	const { body, headers, ...rest } = options;
	const token = readAccessToken();

	const requestHeaders = new Headers(headers);
	if (body !== undefined) requestHeaders.set('Content-Type', 'application/json');
	if (token) requestHeaders.set('Authorization', `Bearer ${token}`);

	const response = await fetch(`${BASE_URL}${path}`, {
		...rest,
		headers: requestHeaders,
		body: body === undefined ? undefined : JSON.stringify(body),
	});

	const contentType = response.headers.get('content-type') ?? '';
	const isJson = contentType.includes('application/json');
	const payload =
		response.status === 204 ? null : isJson ? await response.json() : await response.text();

	if (!response.ok) {
		if (response.status === 401) {
			clearPersistedTokens();
			onUnauthorized?.();
		}
		const message =
			(isJson && payload && typeof payload === 'object' && 'message' in payload
				? String((payload as { message?: unknown }).message ?? '')
				: '') || response.statusText;
		throw new ApiError(response.status, message, payload);
	}

	return payload as T;
}
