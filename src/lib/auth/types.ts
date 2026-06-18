export type UserRole = 'HOST' | 'CO_HOST' | 'GUEST' | 'ADMIN';

export interface AdminUser {
	id: string;
	fullName?: string;
	phoneNumber?: string;
	email?: string;
	isActive?: boolean;
	role?: UserRole;
}

export type AuthStatus = 'loading' | 'authed' | 'anon';

/**
 * Verify-OTP response carries only tokens — user data lives in the JWT
 * payload and is also returned by /auth/me. There is intentionally no
 * `user` field on this response; do not add one.
 */
export interface VerifyOtpResponse {
	accessToken: { token: string };
	refreshToken: { token: string };
}

export interface AuthContextValue {
	status: AuthStatus;
	token: string | null;
	user: AdminUser | null;
	login: (response: VerifyOtpResponse, user: AdminUser) => void;
	logout: () => void;
}
