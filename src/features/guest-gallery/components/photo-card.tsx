interface PhotoCardProps {
	id: string;
	onOpen: (id: string) => void;
}

export function PhotoCard({ id, onOpen }: PhotoCardProps) {
	return (
		<button
			type="button"
			className="aspect-square w-full h-full overflow-hidden rounded-2xl bg-surface-glass backdrop-blur-md"
			onClick={() => onOpen(id)}
		/>
	);
}
