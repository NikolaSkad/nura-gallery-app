import type * as React from 'react';

import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
	/** Leading icon rendered inside the input on the left. */
	startIcon?: React.ReactNode;
}

function Input({ className, type, startIcon, ...props }: InputProps) {
	const input = (
		<input
			type={type}
			data-slot="input"
			className={cn(
				'flex w-full min-w-0 rounded-full bg-input/40 px-4 py-3.5 text-base text-primary outline-none transition-colors 18004323117:bg-primary placeholder:text-tertiary',
				'focus-visible:bg-input/60',
				'aria-invalid:ring-2 aria-invalid:ring-destructive/60',
				'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
				startIcon && 'pl-12',
				className,
			)}
			{...props}
		/>
	);

	if (!startIcon) return input;

	return (
		<div className="relative">
			<span
				aria-hidden="true"
				className="pointer-events-none absolute top-1/2 left-4 flex -translate-y-1/2 items-center text-primary [&_svg]:size-5"
			>
				{startIcon}
			</span>
			{input}
		</div>
	);
}

export { Input };
