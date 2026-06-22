import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { GalleryPhoto } from '@/features/guest-gallery/utils';
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
const ADMIN_GALLERY_KEY = (id: string) => ['admin-gallery', id] as const;

export function useAdminGalleries() {
	const fetcher = useAdminFetch();
	return useQuery({
		queryKey: ADMIN_GALLERIES_KEY,
		queryFn: () => fetcher<Gallery[]>('/gallery/admin/list'),
	});
}

export function useAdminGallery(id: string | undefined) {
	const fetcher = useAdminFetch();
	return useQuery({
		queryKey: ADMIN_GALLERY_KEY(id ?? ''),
		queryFn: () => fetcher<Gallery>(`/gallery/admin/${id}`),
		enabled: Boolean(id),
	});
}

const ADMIN_GALLERY_EVENT_PHOTOS_KEY = (galleryId: string, eventId: string) =>
	['admin-gallery-event-photos', galleryId, eventId] as const;

export function useAdminGalleryEventPhotos(galleryId: string, eventId: string) {
	const fetcher = useAdminFetch();
	return useQuery({
		queryKey: ADMIN_GALLERY_EVENT_PHOTOS_KEY(galleryId, eventId),
		queryFn: () => fetcher<GalleryPhoto[]>(`/gallery/admin/${galleryId}/events/${eventId}/photos`),
		enabled: Boolean(galleryId && eventId),
	});
}

export interface UploadFileInfo {
	fileName: string;
	mimeType: string;
}

export interface UploadUrlResponse {
	fileKey: string;
	bucketFileName: string;
	uploadUrl: string;
	fileName: string;
}

interface RequestUploadUrlsArgs {
	galleryId: string;
	eventId: string;
	files: UploadFileInfo[];
}

export function useRequestUploadUrls() {
	const fetcher = useAdminFetch();
	return useMutation({
		mutationFn: ({ galleryId, eventId, files }: RequestUploadUrlsArgs) =>
			fetcher<UploadUrlResponse[]>(`/gallery/admin/${galleryId}/events/${eventId}/upload-urls`, {
				method: 'POST',
				body: { files },
			}),
	});
}

export interface SyncResult {
	synced: number;
	photos: GalleryPhoto[];
}

interface SyncPhotosArgs {
	galleryId: string;
	eventId: string;
}

export function useSyncPhotos() {
	const fetcher = useAdminFetch();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ galleryId, eventId }: SyncPhotosArgs) =>
			fetcher<SyncResult>(`/gallery/admin/${galleryId}/events/${eventId}/photos/sync`, {
				method: 'POST',
			}),
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({
				queryKey: ADMIN_GALLERY_EVENT_PHOTOS_KEY(vars.galleryId, vars.eventId),
			});
			queryClient.invalidateQueries({ queryKey: ADMIN_GALLERY_KEY(vars.galleryId) });
		},
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

interface BulkAssignGalleryEventDto {
	eventId: string;
	phoneNumbers: string[];
	eventDisplayName?: string;
}

export interface BulkAssignGalleryEventResult {
	created: number;
	assigned: number;
	skipped: number;
	skippedNumbers: { phoneNumber: string; reason: string }[];
	errors: { phoneNumber: string; message: string }[];
}

export function useBulkAssignGalleryEvent() {
	const fetcher = useAdminFetch();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (dto: BulkAssignGalleryEventDto) =>
			fetcher<BulkAssignGalleryEventResult>('/gallery/admin/bulk-assign', {
				method: 'POST',
				body: dto,
			}),
		// The mutation may create new galleries server-side, so the list must refresh.
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ADMIN_GALLERIES_KEY });
		},
	});
}
