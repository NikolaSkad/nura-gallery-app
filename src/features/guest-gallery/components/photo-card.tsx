import { useState } from 'react';
import ChevronLeft from '@/assets/left-chevron.svg?react';
import { SheetPage } from '@/components/sheet-page';
import { Button } from '@/components/ui/button';

export function PhotoCard() {
	const [openSheet, setOpenSheet] = useState(false);
	return (
		<>
			<div
				className="aspect-square w-full overflow-hidden rounded-2xl bg-surface-glass backdrop-blur-md"
				onClick={() => {
					setOpenSheet(true);
				}}
			/>
			<SheetPage
				open={openSheet}
				onClose={() => {
					setOpenSheet(false);
				}}
			>
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] flex justify-between items-center">
					<Button variant="ghost" size="md">
						<ChevronLeft />
					</Button>
					<Button variant="ghost" size="md">
						<ChevronLeft className="rotate-180" />
					</Button>
				</div>
				<div className="flex justify-center items-end flex-1">
					<Button size="sm">Download photo</Button>
				</div>
			</SheetPage>
		</>
	);
}
