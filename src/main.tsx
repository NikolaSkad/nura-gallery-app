import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NotFound } from '@/features/landing/pages/not-found';
import { AuthProvider } from '@/lib/auth/auth-context';
import type { AuthContextValue } from '@/lib/auth/types';
import { useAuth } from '@/lib/auth/use-auth';
import './index.css';
import { routeTree } from './routeTree.gen';

const queryClient = new QueryClient();

const router = createRouter({
	routeTree,
	context: {
		queryClient,
		// Real value is injected by <RouterProvider context={...}> in AppRouter.
		auth: undefined as unknown as AuthContextValue,
	},
	defaultNotFoundComponent: () => <NotFound />,
});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

function AppRouter() {
	const auth = useAuth();
	if (auth.status === 'loading') return null;
	return <RouterProvider router={router} context={{ auth }} />;
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<AppRouter />
			</AuthProvider>
		</QueryClientProvider>
	</StrictMode>,
);
