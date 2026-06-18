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
		<Sheet open={open} onOpenChange={(next) => !next && onClose()}>
			<SheetContent
				className="bg-surface-glass backdrop-blur-2xl sm:max-w-none!"
				showCloseButton={false}
			>
				<SheetHeader>
					<BackButton onClick={onClose} />
					<SheetTitle>{title}</SheetTitle>
					<SheetDescription>{description}</SheetDescription>
				</SheetHeader>
				<div className="flex flex-1 flex-col p-4 pt-0">{children}</div>
			</SheetContent>
		</Sheet>
	);
}
