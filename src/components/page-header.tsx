import type { ReactNode } from 'react';
import { BackButton } from '@/components/back-button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
	/** Replaces the default back button. Use for the home/landing pattern with a title + icon. */
	leftContent?: ReactNode;
	/** Right-side actions: buttons, badges, etc. */
	rightContent?: ReactNode;
	/** Explicit destination for the default back button. Ignored if `leftContent` is set. */
	backTo?: string;
	/** Custom back handler. Ignored if `leftContent` is set. */
	onBack?: () => void;
	className?: string;
}

/**
 * App-wide page header. Three slots — left, right, both optional.
 *
 *   <PageHeader />                                      // back button only
 *   <PageHeader rightContent={<DownloadButton />} />    // back + right action
 *   <PageHeader leftContent={<HeaderTitle icon={<Gallery />}>Photo Gallery</HeaderTitle>} />
 */
export function PageHeader({
	leftContent,
	rightContent,
	backTo,
	onBack,
	className,
}: PageHeaderProps) {
	return (
		<header className={cn('flex items-center justify-between gap-3 p-4 min-h-17', className)}>
			<div className="flex flex-1 items-center justify-start">
				{leftContent ?? <BackButton to={backTo} onClick={onBack} />}
			</div>
			<div className="flex flex-1 items-center justify-end gap-2">{rightContent}</div>
		</header>
	);
}

interface HeaderTitleProps {
	children: ReactNode;
	icon?: ReactNode;
}

/**
 * Title with optional leading icon. Designed to drop into `<PageHeader leftContent={...} />`
 * for the home/landing pattern (no back button).
 */
export function HeaderTitle({ children, icon }: HeaderTitleProps) {
	return (
		<div className="flex items-center gap-2 text-primary">
			{icon && <span className="flex shrink-0 items-center [&_svg]:size-5">{icon}</span>}
			<span className="whitespace-nowrap text-base font-medium">{children}</span>
		</div>
	);
}
