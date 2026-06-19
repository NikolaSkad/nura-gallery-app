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

export const createGallerySchema = z.object({
	phoneNumber: z
		.string()
		.trim()
		.regex(
			/^\+[1-9]\d{6,14}$/,
			'Enter a valid phone number with country code (e.g. +1 555 123 4567)',
		),
	guestName: z.string().trim().min(1, 'Required'),
});

export type CreateGalleryFormData = z.infer<typeof createGallerySchema>;

export const addEventSchema = z.object({
	eventId: z.string().min(1, 'Choose an event'),
	participantIds: z.array(z.string()).min(1, 'Choose at least one participant'),
	eventDisplayName: z.string().trim().max(120, 'Keep it under 120 characters').optional(),
});

export type AddEventFormData = z.infer<typeof addEventSchema>;

export const OTP_LENGTH = 6;
