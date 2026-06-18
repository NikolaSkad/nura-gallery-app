interface AdminGalleryProps {
	id: string;
}

export function AdminGallery({ id }: AdminGalleryProps) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center text-primary">
			<h1 className="text-4xl leading-none tracking-wide">Gallery</h1>
			<p className="text-sm text-muted-foreground">
				Admin gallery view for <span className="text-primary">{id}</span>. Header (back + copy
				link), shared <code>{'<GalleryList />'}</code>, and "Add Event" land here.
			</p>
		</div>
	);
}
