import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const titleVariants = cva('leading-none tracking-wide text-primary', {
	variants: {
		size: {
			sm: 'text-2xl',
			md: 'text-3xl',
			lg: 'text-4xl',
			xl: 'text-5xl',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

interface TitleProps extends VariantProps<typeof titleVariants> {
	children: ReactNode;
	as?: 'h1' | 'h2';
	className?: string;
}

export function Title({ children, size, as: Tag = 'h1', className }: TitleProps) {
	return <Tag className={cn(titleVariants({ size }), className)}>{children}</Tag>;
}
