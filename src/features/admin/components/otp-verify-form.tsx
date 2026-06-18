import { useState } from 'react';

import { Title } from '@/components/title';
import { useVerifyOtp } from '@/features/admin/api/auth';
import { OtpInput } from '@/features/admin/components/otp-input';
import { ResendCodeButton } from '@/features/admin/components/resend-code-button';
import { OTP_LENGTH } from '@/features/admin/utils';
import type { VerifyOtpResponse } from '@/lib/auth/types';

interface OtpVerifyFormProps {
	phoneNumber: string;
	onSuccess: (response: VerifyOtpResponse) => void;
}

export function OtpVerifyForm({ phoneNumber, onSuccess }: OtpVerifyFormProps) {
	const verifyOtp = useVerifyOtp();
	const [otp, setOtp] = useState('');
	const [verifyError, setVerifyError] = useState(false);

	const submitOtp = async (code: string) => {
		if (code.length !== OTP_LENGTH || verifyOtp.isPending) return;
		try {
			const response = await verifyOtp.mutateAsync({
				phoneNumber,
				verificationCode: code,
			});
			onSuccess(response);
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

	return (
		<div className="mx-auto flex w-full max-w-sm flex-col gap-6">
			<div className="flex flex-col gap-2 text-center">
				<Title>Enter verification code</Title>
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
				{verifyOtp.isPending ? <p className="text-sm text-muted-foreground">Verifying…</p> : null}
				<ResendCodeButton
					phoneNumber={phoneNumber}
					onSuccess={() => {
						setOtp('');
						setVerifyError(false);
					}}
				/>
			</div>
		</div>
	);
}
