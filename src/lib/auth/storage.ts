/**
 * LS keys are shared with the main NURA Events app — do not rename, do not
 * obfuscate. Both apps read the same session from the same origin's storage.
 */
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export interface PersistedTokens {
	accessToken: string;
	refreshToken: string;
}

export function readPersistedTokens(): PersistedTokens | null {
	const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
	const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
	if (!accessToken || !refreshToken) return null;
	return { accessToken, refreshToken };
}

export function writePersistedTokens(tokens: PersistedTokens): void {
	localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
	localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearPersistedTokens(): void {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function readAccessToken(): string | null {
	return localStorage.getItem(ACCESS_TOKEN_KEY);
}
