import { useQuery } from '@tanstack/react-query';

import { adminFetch } from '@/lib/api';

export interface EventHost {
	id: string;
	fullName: string;
	phoneNumber: string;
	isActive: boolean;
}

export interface AdminEvent {
	id: string;
	venueId: number;
	hostId: string;
	host: EventHost;
	status: string;
	name: string;
	description: string;
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
