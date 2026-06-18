import type * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				'flex h-11 w-full min-w-0 rounded-full border border-input bg-input/40 px-4 py-2 text-base text-foreground shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-tertiary',
				'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40',
				'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/40',
				'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
