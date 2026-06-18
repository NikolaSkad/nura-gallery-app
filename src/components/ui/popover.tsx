import { Popover as PopoverPrimitive } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/utils';

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
	className,
	align = 'start',
	sideOffset = 6,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				data-slot="popover-content"
				align={align}
				sideOffset={sideOffset}
				className={cn(
					'z-50 w-(--radix-popover-trigger-width) origin-(--radix-popover-content-transform-origin) rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-lg outline-none',
					'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
					'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
					className,
				)}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	);
}

export { Popover, PopoverContent, PopoverTrigger };
