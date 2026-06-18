import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const cardVariants = cva('flex flex-col rounded-2xl transition-colors', {
	variants: {
		variant: {
			default: 'bg-card text-card-foreground',
			glass: 'bg-surface-glass text-primary backdrop-blur-md',
			primary: 'bg-primary text-primary-foreground',
		},
		padding: {
			none: 'p-0',
			sm: 'gap-0.5 p-3',
			md: 'gap-1 p-4',
			lg: 'gap-2 p-6',
		},
	},
	defaultVariants: {
		variant: 'default',
		padding: 'md',
	},
});

function Card({
	className,
	variant,
	padding,
	asChild = false,
	...props
}: React.ComponentProps<'div'> &
	VariantProps<typeof cardVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : 'div';
	return (
		<Comp
			data-slot="card"
			data-variant={variant}
			className={cn(cardVariants({ variant, padding, className }))}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
	return (
		<h3
			data-slot="card-title"
			className={cn('text-sm font-medium leading-5', className)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p
			data-slot="card-description"
			className={cn('text-xs leading-[18px]', className)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
	return <div data-slot="card-content" className={cn('flex flex-col', className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardTitle, cardVariants };
