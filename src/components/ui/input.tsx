import type * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				'flex w-full min-w-0 rounded-full bg-input/40 px-4 py-3.5 text-base text-primary outline-none transition-colors 18004323117:bg-primary placeholder:text-tertiary',
				'focus-visible:bg-input/60',
				'aria-invalid:ring-2 aria-invalid:ring-destructive/60',
				'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
