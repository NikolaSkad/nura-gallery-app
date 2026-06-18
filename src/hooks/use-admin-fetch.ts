import { useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';
import { flushSync } from 'react-dom';

import { ApiError, bearerFetch, type FetchOptions } from '@/lib/api';
import { useAuth } from '@/lib/auth/use-auth';

/**
 * Authenticated fetcher for admin queries. Closes over the current auth token
 * via context, so the latest token is sent on every call. On 401, dispatches
 * logout + router.invalidate inline — no module-level callback, no effect
 * bridging React state to a side-channel.
 *
 * Must be called from inside the router (AppRouter's RouterProvider tree).
 * For pre-auth or above-router calls (e.g. /auth/me at boot), use bearerFetch.
 */
export function useAdminFetch() {
	const { token, logout } = useAuth();
	const router = useRouter();

	return useCallback(
		async <T = unknown>(path: string, options: FetchOptions = {}): Promise<T> => {
			if (!token) {
				flushSync(() => logout());
				router.invalidate();
				throw new ApiError(401, 'Missing access token', null);
			}
			try {
				return await bearerFetch<T>(path, token, options);
			} catch (err) {
				if (err instanceof ApiError && err.status === 401) {
					// flushSync so the auth state update commits BEFORE invalidate,
					// otherwise the router's beforeLoad re-runs against stale context.
					flushSync(() => logout());
					router.invalidate();
				}
				throw err;
			}
		},
		[token, logout, router],
	);
}
