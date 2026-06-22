import { useQuery } from '@tanstack/react-query';

import { guestFetch } from '@/lib/api';

export interface GuestGalleryEvent {
	eventId: string;
	displayName: string;
	photoCount: number;
	startAt?: string | null;
	endAt?: string | null;
	venueName?: string | null;
}

export interface GuestGalleryHome {
	displayName: string;
	events: GuestGalleryEvent[];
}

const GUEST_GALLERY_KEY = (token: string) => ['guest-gallery', token] as const;

export function useGuestGallery(token: string | undefined) {
	return useQuery({
		queryKey: GUEST_GALLERY_KEY(token ?? ''),
		queryFn: () => guestFetch<GuestGalleryHome>(`/gallery/${token}`),
		enabled: Boolean(token),
	});
}
