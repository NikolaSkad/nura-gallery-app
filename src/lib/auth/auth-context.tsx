import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { bearerFetch } from '@/lib/api';
import {
	clearPersistedTokens,
	readPersistedTokens,
	writePersistedTokens,
} from '@/lib/auth/storage';
import type { AdminUser, AuthContextValue, AuthStatus, VerifyOtpResponse } from '@/lib/auth/types';

export const AuthContext = createContext<AuthContextValue | null>(null);

const ME_QUERY_KEY = ['auth', 'me'] as const;

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();
	const persisted = useRef(readPersistedTokens()).current;
	const [token, setToken] = useState<string | null>(persisted?.accessToken ?? null);
	// `hydrated` is a one-shot flag: false only during the initial /auth/me
	// fetch at boot. After it flips to true, status is derived solely from
	// `token` — so login/logout transitions never pass through 'loading' and
	// never unmount the RouterProvider in `main.tsx`. Without this, the brief
	// window where `setToken` had committed but `setQueryData` hadn't
	// propagated to the useQuery subscriber yielded status='loading', which
	// caused AppRouter to return null and AdminLogin to remount fresh
	// (phase='request') for one tick before the boundary redirected.
	const [hydrated, setHydrated] = useState(persisted === null);

	const meQuery = useQuery({
		queryKey: ME_QUERY_KEY,
		queryFn: () => bearerFetch<AdminUser>('/auth/me', token as string),
		enabled: token !== null && !hydrated,
		retry: false,
		staleTime: Number.POSITIVE_INFINITY,
	});

	const logout = useCallback(() => {
		clearPersistedTokens();
		setToken(null);
		queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
	}, [queryClient]);

	const login = useCallback(
		(response: VerifyOtpResponse) => {
			writePersistedTokens({
				accessToken: response.accessToken.token,
				refreshToken: response.refreshToken.token,
			});
			queryClient.setQueryData(ME_QUERY_KEY, response.user);
			setToken(response.accessToken.token);
		},
		[queryClient],
	);

	// Boot hydration: once /auth/me resolves (success or error), flip hydrated.
	// On error, also clear the unusable persisted token. 401 specifically is
	// already handled by adminFetch → onUnauthorized → logout, but the effect
	// covers non-401 (network, server) failures too.
	useEffect(() => {
		if (!meQuery.isSuccess && !meQuery.isError) return;
		if (meQuery.isError && token !== null) logout();
		setHydrated(true);
	}, [meQuery.isSuccess, meQuery.isError, token, logout]);

	const status: AuthStatus = useMemo(() => {
		if (!hydrated) return 'loading';
		return token === null ? 'anon' : 'authed';
	}, [hydrated, token]);

	const user = queryClient.getQueryData<AdminUser>(ME_QUERY_KEY) ?? meQuery.data ?? null;

	const value = useMemo<AuthContextValue>(
		() => ({ status, token, user, login, logout }),
		[status, token, user, login, logout],
	);

	return <AuthContext value={value}>{children}</AuthContext>;
}
