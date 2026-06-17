import { useRouter } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
	/** Explicit navigation target. Overrides smart history-back. */
	to?: string;
	/** Custom click handler. Overrides both `to` and smart history-back. */
	onClick?: () => void;
	className?: string;
	/** Accessible label override. Defaults to "Go back". */
	'aria-label'?: string;
}

/**
 * Subtle circular back button with smart navigation:
 * 1. If `onClick` is provided, calls that.
 * 2. Else if `to` is provided, navigates there.
 * 3. Else if there's in-app history, goes back one step.
 * 4. Else navigates to "/" (covers the case where the user opened the URL directly).
 */
export function BackButton({
	to,
	onClick,
	className,
	'aria-label': ariaLabel = 'Go back',
}: BackButtonProps) {
	const router = useRouter();

	const handleClick = () => {
		if (onClick) {
			onClick();
			return;
		}
		if (to) {
			router.navigate({ to });
			return;
		}
		if (window.history.length > 1) {
			router.history.back();
		} else {
			router.navigate({ to: '/' });
		}
	};

	return (
		<Button
			variant="icon"
			size="icon"
			onClick={handleClick}
			aria-label={ariaLabel}
			className={cn(className)}
		>
			<ArrowLeft className="w-5 h-5" />
		</Button>
	);
}
