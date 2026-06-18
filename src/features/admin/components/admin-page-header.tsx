import { LogOut } from 'lucide-react';
import type { ReactNode } from 'react';

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

	return (
		<PageHeader
			{...pageHeaderProps}
			rightContent={
				<>
					{pageHeaderProps.rightContent}
					<Button variant="subtle" size="icon" onClick={logout} aria-label="Log out" type="button">
						<LogOut className="h-5 w-5" />
					</Button>
				</>
			}
		/>
	);
}

export { HeaderTitle };
