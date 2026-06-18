import { z } from 'zod';

export const phoneSchema = z.object({
	phoneNumber: z
		.string()
		.trim()
		.regex(
			/^\+[1-9]\d{6,14}$/,
			'Enter a valid phone number with country code (e.g. +1 555 123 4567)',
		),
});

export type PhoneFormData = z.infer<typeof phoneSchema>;

export const OTP_LENGTH = 6;
