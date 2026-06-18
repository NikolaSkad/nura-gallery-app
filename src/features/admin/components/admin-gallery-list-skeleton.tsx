import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminGalleryListSkeletonProps {
	count?: number;
}

export function AdminGalleryListSkeleton({ count = 3 }: AdminGalleryListSkeletonProps) {
	return (
		<ul className="flex flex-col gap-2" aria-busy="true" aria-live="polite">
			{Array.from({ length: count }).map((_, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows are positional, not data-backed
				<li key={index}>
					<Card variant="glass" padding="sm">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-[18px] w-40" />
					</Card>
				</li>
			))}
		</ul>
	);
}
