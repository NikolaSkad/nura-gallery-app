import { useRouter } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';

import { HeaderTitle, PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/use-auth';

interface AdminPageHeaderProps {
	leftContent?: ReactNode;
	rightContent?: ReactNode;
	backTo?: string;
	onBack?: () => void;
}

export function AdminPageHeader(pageHeaderProps: AdminPageHeaderProps) {
	const { logout } = useAuth();
	const router = useRouter();

	const handleLogout = () => {
		// Commit the auth state flip BEFORE invalidating, otherwise router
		// context still carries the old (authed) value when beforeLoad re-runs
		// and the boundary doesn't redirect on the first click.
		flushSync(() => logout());
		router.invalidate();
	};

	return (
		<PageHeader
			{...pageHeaderProps}
			rightContent={
				<>
					{pageHeaderProps.rightContent}
					<Button
						variant="subtle"
						size="icon"
						onClick={handleLogout}
						aria-label="Log out"
						type="button"
					>
						<LogOut className="h-5 w-5" />
					</Button>
				</>
			}
		/>
	);
}

export { HeaderTitle };
