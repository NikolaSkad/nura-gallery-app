export interface AdminUser {
	id: string;
	phone: string;
	firstName?: string;
	lastName?: string;
	email?: string;
}

export type AuthStatus = 'loading' | 'authed' | 'anon';

export interface VerifyOtpResponse {
	user: AdminUser;
	accessToken: { token: string };
	refreshToken: { token: string };
}

export interface AuthContextValue {
	status: AuthStatus;
	token: string | null;
	user: AdminUser | null;
	login: (response: VerifyOtpResponse) => void;
	logout: () => void;
}
