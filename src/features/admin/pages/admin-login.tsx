import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { flushSync } from 'react-dom';

import { PageHeader } from '@/components/page-header';
import { OtpVerifyForm } from '@/features/admin/components/otp-verify-form';
import { PhoneRequestForm } from '@/features/admin/components/phone-request-form';
import type { VerifyOtpResponse } from '@/lib/auth/types';
import { useAuth } from '@/lib/auth/use-auth';

export function AdminLogin() {
	const { login } = useAuth();
	const router = useRouter();
	const [phase, setPhase] = useState<'request' | 'verify'>('request');
	const [phoneNumber, setPhoneNumber] = useState('');

	const handleVerifySuccess = (response: VerifyOtpResponse) => {
		// Commit the auth flip BEFORE invalidating so beforeLoad on this route
		// sees status='authed' on the re-run and redirects to /admin. Symmetric
		// with logout — no useEffect cascade watching status.
		flushSync(() => login(response));
		router.invalidate();
	};

	const handlePhoneSuccess = (number: string) => {
		setPhoneNumber(number);
		setPhase('verify');
	};

	const backToPhone = () => setPhase('request');

	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col">
			{phase === 'request' ? <PageHeader backTo="/" /> : <PageHeader onBack={backToPhone} />}
			<main className="flex flex-1 flex-col justify-center px-6 py-12">
				{phase === 'request' ? (
					<PhoneRequestForm onSuccess={handlePhoneSuccess} />
				) : (
					<OtpVerifyForm phoneNumber={phoneNumber} onSuccess={handleVerifySuccess} />
				)}
			</main>
		</div>
	);
}
