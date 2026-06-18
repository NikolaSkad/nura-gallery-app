import { useMutation } from '@tanstack/react-query';

import { publicFetch } from '@/lib/api';
import type { VerifyOtpResponse } from '@/lib/auth/types';

interface RequestOtpDto {
	phoneNumber: string;
}

interface VerifyOtpDto {
	phoneNumber: string;
	verificationCode: string;
}

export function useRequestOtp() {
	return useMutation({
		mutationFn: (dto: RequestOtpDto) =>
			publicFetch<void>('/auth/sms/generate', { method: 'POST', body: dto }),
	});
}

export function useVerifyOtp() {
	return useMutation({
		mutationFn: (dto: VerifyOtpDto) =>
			publicFetch<VerifyOtpResponse>('/auth/sms/validate', {
				method: 'POST',
				body: dto,
			}),
	});
}
