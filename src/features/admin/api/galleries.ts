import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAdminFetch } from '@/hooks/use-admin-fetch';

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
	const fetcher = useAdminFetch();
	return useQuery({
		queryKey: ADMIN_GALLERIES_KEY,
		queryFn: () => fetcher<Gallery[]>('/gallery/admin/list'),
	});
}

export function useCreateGallery() {
	const fetcher = useAdminFetch();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (dto: CreateGalleryDto) =>
			fetcher<Gallery>('/gallery/admin', { method: 'POST', body: dto }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ADMIN_GALLERIES_KEY });
		},
	});
}
