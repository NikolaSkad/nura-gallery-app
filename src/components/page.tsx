import type { ReactNode } from 'react';

interface PageProps {
	children: ReactNode;
}

/**
 * Outer page wrapper — fills the route-group shell vertically and provides
 * the standard page rhythm (gap below the header, bottom padding).
 */
export function Page({ children }: PageProps) {
	return <div className="flex flex-1 flex-col gap-8 pb-8">{children}</div>;
}

interface PageMainProps {
	children: ReactNode;
}

/**
 * Semantic <main> wrapper with the standard content padding and rhythm.
 */
export function PageMain({ children }: PageMainProps) {
	return <main className="flex flex-col gap-8 px-3">{children}</main>;
}
