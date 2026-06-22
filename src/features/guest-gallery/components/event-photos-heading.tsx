import { Title } from '@/components/title';
import { formatEventDateTime } from '@/lib/format';

interface EventPhotosHeadingProps {
	name?: string;
	startAt?: string;
	endAt?: string;
	isLoading?: boolean;
}

export function EventPhotosHeading({ name, startAt, endAt, isLoading }: EventPhotosHeadingProps) {
	const dateTime = startAt && endAt ? formatEventDateTime(startAt, endAt) : null;
	const titleText = name ?? (isLoading ? 'Loading…' : 'Event');
	return (
		<div className="flex flex-col gap-3">
			<Title>{titleText}</Title>
			{dateTime ? (
				<p className="text-sm text-primary">
					{dateTime.date} | {dateTime.time}
				</p>
			) : null}
		</div>
	);
}
