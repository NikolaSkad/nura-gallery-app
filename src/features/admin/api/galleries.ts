import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminFetch } from '@/lib/api';

interface CreateGalleryDto {
	displayName: string;
	phoneNumber: string;
}

export interface GalleryEvent {
	id: string;
	eventId: string;
	displayName: string;
	createdAt: string;
	photoCount: number;
}

export interface Gallery {
	id: string;
	phoneNumber: string;
	displayName: string;
	token: string;
	createdByUserId: string;
	createdAt: string;
	updatedAt: string;
	events: GalleryEvent[];
}

const ADMIN_GALLERIES_KEY = ['admin-galleries'] as const;

export function useAdminGalleries() {
	return useQuery({
		queryKey: ADMIN_GALLERIES_KEY,
		queryFn: () => adminFetch<Gallery[]>('/gallery/admin/list'),
	});
}

export function useCreateGallery() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (dto: CreateGalleryDto) =>
			adminFetch<Gallery>('/gallery/admin', { method: 'POST', body: dto }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ADMIN_GALLERIES_KEY });
		},
	});
}
