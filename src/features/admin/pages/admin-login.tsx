import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { OtpVerifyForm } from '@/features/admin/components/otp-verify-form';
import { PhoneRequestForm } from '@/features/admin/components/phone-request-form';
import { useAuth } from '@/lib/auth/use-auth';

export function AdminLogin() {
	const { login, status } = useAuth();
	const navigate = useNavigate();
	const [phase, setPhase] = useState<'request' | 'verify'>('request');
	const [phoneNumber, setPhoneNumber] = useState('');

	// Drives the OTP-success → /admin transition.
	// Runs in a useEffect (not inline after login()) so React commits the auth
	// state change first — by the time this fires, status is reliably 'authed'.
	// Doing it inline races the commit and either (a) fires with stale 'anon'
	// state, or (b) interleaves with the boundary's redirect logic. Also covers
	// the case where the user lands on /admin/login while already authed —
	// boundary handles that at beforeLoad time, but this effect is the
	// belt-and-suspenders for any path that gets through.
	useEffect(() => {
		if (status === 'authed') navigate({ to: '/admin' });
	}, [status, navigate]);

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
					<OtpVerifyForm phoneNumber={phoneNumber} onSuccess={login} />
				)}
			</main>
		</div>
	);
}
