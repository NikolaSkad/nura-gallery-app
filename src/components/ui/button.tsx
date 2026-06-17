import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	"group/button inline-flex shrink-0 touch-manipulation items-center justify-center border border-solid bg-clip-padding font-medium whitespace-nowrap transition-colors duration-150 outline-none select-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive/50 aria-invalid:ring-2 aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
	{
		variants: {
			variant: {
				outline:
					'border-primary bg-transparent text-primary backdrop-blur-[5px] hover:bg-primary/20 active:bg-primary/20',
				ghost:
					'border-transparent bg-transparent text-primary hover:bg-primary/20 active:bg-primary/20',
				filled:
					'border-primary bg-primary text-primary-foreground hover:bg-primary/80 active:bg-primary/80',
				icon: 'border-transparent bg-secondary text-primary hover:bg-secondary/70 active:bg-secondary/70',
			},
			size: {
				xs: 'gap-1 rounded-full px-1.5 py-0.5 text-[10px] leading-[14px]',
				sm: 'gap-1 rounded-full px-2 py-1 text-xs leading-[18px]',
				default: 'gap-2 rounded-full px-4 py-3 text-base leading-6',
				lg: 'gap-2.5 rounded-full px-5 py-3.5 text-lg leading-7',
				icon: 'size-9 gap-0 rounded-full',
			},
		},
		// compoundVariants: [
		// 	{
		// 		variant: 'filled',
		// 		size: 'xs',
		// 		class: 'rounded-[10px] px-2 py-0.5',
		// 	},
		// 	{
		// 		variant: 'filled',
		// 		size: 'sm',
		// 		class: 'rounded-[14px] px-3 py-1',
		// 	},
		// 	{
		// 		variant: 'filled',
		// 		size: 'default',
		// 		class: 'rounded-[20px] px-5 py-3 text-sm leading-5',
		// 	},
		// 	{
		// 		variant: 'filled',
		// 		size: 'lg',
		// 		class: 'rounded-[24px] px-6 py-4',
		// 	},
		// 	{
		// 		variant: 'filled',
		// 		size: 'icon-sm',
		// 		class: 'rounded-[14px]',
		// 	},
		// 	{
		// 		variant: 'filled',
		// 		size: 'icon',
		// 		class: 'rounded-[20px]',
		// 	},
		// 	{
		// 		variant: 'filled',
		// 		size: 'icon-lg',
		// 		class: 'rounded-[24px]',
		// 	},
		// ],
		defaultVariants: {
			variant: 'outline',
			size: 'default',
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : 'button';

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
