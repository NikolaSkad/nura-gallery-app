import { useQuery } from '@tanstack/react-query';

import { adminFetch } from '@/lib/api';

export type ParticipantRole = 'HOST' | 'CO_HOST' | 'GUEST';
export type RsvpStatus = 'PENDING' | 'GOING' | 'DECLINED';

export interface ParticipantUser {
	id: string;
	fullName: string;
	phoneNumber: string;
	isActive: boolean;
}

export interface EventParticipant {
	id: string;
	eventId: string;
	userId: string;
	user: ParticipantUser;
	role: ParticipantRole;
	rsvpStatus: RsvpStatus;
	isPlusOne: boolean | null;
	plusOneName: string | null;
	plusOnePhoneNumber: string | null;
}

export function useEventParticipants(eventId: string | undefined) {
	return useQuery({
		queryKey: ['event-participants', eventId ?? ''] as const,
		queryFn: () => adminFetch<EventParticipant[]>(`/events/${eventId}/participants`),
		enabled: Boolean(eventId),
	});
}

export interface EventHost {
	id: string;
	fullName: string;
	phoneNumber: string;
	isActive: boolean;
}

export type EventStatus = 'ARCHIVED' | 'PENDING' | 'REJECTED' | 'APPROVED' | 'PAID' | 'FINISHED';

export interface AdminEvent {
	id: string;
	venueId: number;
	hostId: string;
	host?: EventHost;
	status: EventStatus;
	name: string;
	description: string | null;
	startAt: string;
	endAt: string;
	maxGuests: number;
	createdAt: string;
	updatedAt: string;
	archivedAt: string | null;
}

export interface EventFilterDto {
	userId?: string;
	status?: string;
	venueId?: number;
	limit?: number;
	offset?: number;
}

export interface SearchEventsResult {
	events: AdminEvent[];
	total: number;
	limit: number;
	offset: number;
}

const ADMIN_EVENTS_SEARCH_KEY = ['admin-events-search'] as const;

export function useAdminEventsSearch(filter: EventFilterDto = {}) {
	return useQuery({
		queryKey: [...ADMIN_EVENTS_SEARCH_KEY, filter],
		queryFn: () =>
			adminFetch<SearchEventsResult>('/events/admin/search', {
				method: 'POST',
				body: filter,
			}),
	});
}
