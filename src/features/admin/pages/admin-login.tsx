import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRequestOtp, useVerifyOtp } from '@/features/admin/api/auth';
import { OtpInput } from '@/features/admin/components/otp-input';
import { ResendCodeButton } from '@/features/admin/components/resend-code-button';
import { useAuth } from '@/lib/auth/use-auth';

const phoneSchema = z.object({
	phoneNumber: z
		.string()
		.trim()
		.regex(
			/^\+[1-9]\d{6,14}$/,
			'Enter a valid phone number with country code (e.g. +1 555 123 4567)',
		),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

const OTP_LENGTH = 6;

export function AdminLogin() {
	const { login, status } = useAuth();
	const navigate = useNavigate();
	const requestOtp = useRequestOtp();
	const verifyOtp = useVerifyOtp();
	const [phase, setPhase] = useState<'request' | 'verify'>('request');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [otp, setOtp] = useState('');
	const [verifyError, setVerifyError] = useState(false);

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

	const phoneForm = useForm<PhoneFormData>({
		resolver: zodResolver(phoneSchema),
		defaultValues: { phoneNumber: '' },
		mode: 'onSubmit',
	});

	const submitPhone = phoneForm.handleSubmit(async (data) => {
		const trimmed = data.phoneNumber.trim();
		try {
			await requestOtp.mutateAsync({ phoneNumber: trimmed });
			setPhoneNumber(trimmed);
			setOtp('');
			setVerifyError(false);
			setPhase('verify');
		} catch (err) {
			phoneForm.setError('phoneNumber', {
				message: extractApiMessage(err) ?? 'Failed to send verification code',
			});
		}
	});

	const submitOtp = async (code: string) => {
		if (code.length !== OTP_LENGTH || verifyOtp.isPending) return;
		try {
			const response = await verifyOtp.mutateAsync({
				phoneNumber,
				verificationCode: code,
			});
			login(response);
			// Navigation is handled by the useEffect on `status` above.
		} catch {
			setVerifyError(true);
			setOtp('');
		}
	};

	const handleOtpChange = (value: string) => {
		const numericValue = value.replaceAll(/\D/g, '').slice(0, OTP_LENGTH);
		setOtp(numericValue);
		if (verifyError) setVerifyError(false);
		if (numericValue.length === OTP_LENGTH) {
			void submitOtp(numericValue);
		}
	};

	const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		// Normalize pasted phone numbers to E.164 — strip whitespace/formatting,
		// ensure a leading `+`. Treat a leading `00` (some non-US conventions) as
		// the international prefix.
		const pasted = e.clipboardData.getData('text');
		let digits = pasted.replace(/\D/g, '');
		if (!digits) return;
		if (digits.startsWith('00')) digits = digits.slice(2);
		e.preventDefault();
		phoneForm.setValue('phoneNumber', `+${digits}`, { shouldValidate: false });
	};

	const backToPhone = () => {
		setPhase('request');
		setOtp('');
		setVerifyError(false);
	};

	const phoneError = phoneForm.formState.errors.phoneNumber?.message;

	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col">
			{phase === 'request' ? <PageHeader backTo="/" /> : <PageHeader onBack={backToPhone} />}
			<main className="flex flex-1 flex-col justify-center px-6 py-12">
				{phase === 'request' ? (
					<form onSubmit={submitPhone} className="mx-auto flex w-full max-w-sm flex-col gap-6">
						<div className="flex flex-col gap-2 text-center">
							<h1 className="text-3xl leading-none tracking-wide text-primary">Admin sign in</h1>
							<p className="text-sm text-muted-foreground">
								Enter the phone number associated with your NURA admin account.
							</p>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="admin-phone">Phone number</Label>
							<Input
								id="admin-phone"
								type="tel"
								inputMode="tel"
								autoComplete="tel"
								placeholder="+1 555 123 4567"
								aria-invalid={Boolean(phoneError)}
								autoFocus
								onPaste={handlePhonePaste}
								{...phoneForm.register('phoneNumber')}
							/>
							{phoneError ? (
								<p className="text-sm text-destructive" role="alert">
									{phoneError}
								</p>
							) : null}
						</div>
						<Button
							type="submit"
							size="lg"
							disabled={requestOtp.isPending || phoneForm.formState.isSubmitting}
						>
							{requestOtp.isPending ? 'Sending…' : 'Send code'}
						</Button>
					</form>
				) : (
					<div className="mx-auto flex w-full max-w-sm flex-col gap-6">
						<div className="flex flex-col gap-2 text-center">
							<h1 className="text-3xl leading-none tracking-wide text-primary">
								Enter verification code
							</h1>
							<p className="text-sm text-muted-foreground">
								We sent a code to <span className="font-medium text-primary">{phoneNumber}</span>
							</p>
						</div>
						<OtpInput length={OTP_LENGTH} value={otp} onChange={handleOtpChange} autoFocus />
						<div className="flex flex-col items-center gap-2">
							{verifyError ? (
								<p className="text-sm text-destructive" role="alert">
									Wrong code, try again
								</p>
							) : null}
							{verifyOtp.isPending ? (
								<p className="text-sm text-muted-foreground">Verifying…</p>
							) : null}
							<ResendCodeButton
								phoneNumber={phoneNumber}
								onSuccess={() => {
									setOtp('');
									setVerifyError(false);
								}}
							/>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

function extractApiMessage(err: unknown): string | undefined {
	if (err instanceof Error && err.message) return err.message;
	return undefined;
}
