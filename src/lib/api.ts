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

export interface FetchOptions extends Omit<RequestInit, 'body'> {
	body?: unknown;
}

async function request<T>(path: string, options: FetchOptions, token: string | null): Promise<T> {
	const { body, headers, ...rest } = options;

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
		const message =
			(isJson && payload && typeof payload === 'object' && 'message' in payload
				? String((payload as { message?: unknown }).message ?? '')
				: '') || response.statusText;
		throw new ApiError(response.status, message, payload);
	}

	return payload as T;
}

export function publicFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
	return request<T>(path, options, null);
}

// Guest gallery calls — token in the URL is the only credential. Alias of
// publicFetch with a domain-specific name so call sites are explicit about
// the auth model (and never accidentally swapped for adminFetch, which would
// leak the JWT into a public context).
export function guestFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
	return request<T>(path, options, null);
}

export function bearerFetch<T = unknown>(
	path: string,
	token: string,
	options: FetchOptions = {},
): Promise<T> {
	return request<T>(path, options, token);
}
