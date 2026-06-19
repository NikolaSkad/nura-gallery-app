export const PHOTO_IDS = Array.from({ length: 15 }, (_, i) => `img-${i}`);

export interface GalleryEventItem {
	id: string;
	title: string;
	description: string;
}

export const MOCK_GALLERY_NAME = 'John Williams gallery';

export const MOCK_GALLERY_EVENTS: GalleryEventItem[] = [
	{ id: '1', title: 'Event 1', description: 'Friday 24 Oct, 18:00 - 21:00' },
	{ id: '2', title: 'Event 2', description: 'Saturday 25 Oct, 14:00 - 18:00' },
	{ id: '3', title: 'Event 3', description: 'Sunday 26 Oct, 16:00 - 20:00' },
];
