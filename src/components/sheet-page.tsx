import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { BackButton } from './back-button';

interface SheetPageProps {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title?: string;
	description?: string;
}

export function SheetPage({ open, onClose, children, description, title }: SheetPageProps) {
	return (
		<Sheet open={open} onOpenChange={(next) => !next && onClose()} modal={false}>
			<SheetContent
				className="overflow-hidden bg-[url(/fireplace.jpg)] bg-cover bg-center bg-no-repeat sm:max-w-none!"
				showCloseButton={false}
			>
				<div aria-hidden className="pointer-events-none absolute inset-0 bg-background/80" />
				{/* <div aria-hidden className="pointer-events-none absolute inset-0 bg-surface-glass" /> */}
				<SheetHeader className="relative">
					<BackButton onClick={onClose} />
					<SheetTitle>{title}</SheetTitle>
					<SheetDescription>{description}</SheetDescription>
				</SheetHeader>
				<div className="relative flex flex-1 flex-col p-4 pt-0">{children}</div>
			</SheetContent>
		</Sheet>
	);
}
