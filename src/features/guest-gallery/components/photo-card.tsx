import { useState } from 'react';
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
				<div className="flex justify-center items-end flex-1">
					<Button size="sm">Download photo</Button>
				</div>
			</SheetPage>
		</>
	);
}
