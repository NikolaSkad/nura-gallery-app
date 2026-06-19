import { type NavigateOptions, useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback } from 'react';

export interface PhotoLightboxController {
	openId: string | undefined;
	openImage: (id: string) => void;
	closeImage: () => void;
	prevImage: () => void;
	nextImage: () => void;
	hasPrev: boolean;
	hasNext: boolean;
}

export function usePhotoLightbox(photoIds: string[]): PhotoLightboxController {
	const { img } = useSearch({ strict: false }) as { img?: string };
	const navigate = useNavigate();

	const setImg = useCallback(
		(id: string | undefined) => {
			// Route-agnostic helper: `useNavigate()` without `from` types `search` against
			// the root route (no search shape), so the reducer collapses to `never`. Each
			// caller route's own `validateSearch` enforces `img` at runtime.
			navigate({
				search: (prev: { img?: string }) => ({ ...prev, img: id }),
				replace: true,
			} as NavigateOptions);
		},
		[navigate],
	);

	const openImage = useCallback((id: string) => setImg(id), [setImg]);
	const closeImage = useCallback(() => setImg(undefined), [setImg]);

	const openId = img && photoIds.includes(img) ? img : undefined;
	const index = openId ? photoIds.indexOf(openId) : -1;
	const prevId = index > 0 ? photoIds[index - 1] : undefined;
	const nextId = index >= 0 && index < photoIds.length - 1 ? photoIds[index + 1] : undefined;

	const prevImage = useCallback(() => {
		if (prevId) setImg(prevId);
	}, [prevId, setImg]);
	const nextImage = useCallback(() => {
		if (nextId) setImg(nextId);
	}, [nextId, setImg]);

	return {
		openId,
		openImage,
		closeImage,
		prevImage,
		nextImage,
		hasPrev: Boolean(prevId),
		hasNext: Boolean(nextId),
	};
}
