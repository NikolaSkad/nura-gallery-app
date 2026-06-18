import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useRequestOtp } from '@/features/admin/api/auth';

interface ResendCodeButtonProps {
	phoneNumber: string;
	initialCountdown?: number;
	onSuccess?: () => void;
}

export function ResendCodeButton({
	phoneNumber,
	initialCountdown = 15,
	onSuccess,
}: ResendCodeButtonProps) {
	const [countdown, setCountdown] = useState(initialCountdown);
	const requestOtp = useRequestOtp();

	useEffect(() => {
		if (countdown <= 0) return;
		const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
		return () => clearTimeout(timer);
	}, [countdown]);

	const canResend = countdown <= 0;

	const handleResend = async () => {
		try {
			await requestOtp.mutateAsync({ phoneNumber });
			setCountdown(initialCountdown);
			onSuccess?.();
		} catch {
			// inline error surfacing lives on the page; resend just silently fails
			// for now (matches NURA Events' console-only handling for resend).
		}
	};

	if (!canResend) {
		return <p className="text-sm text-muted-foreground">Resend code in {countdown}s</p>;
	}

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onClick={handleResend}
			disabled={requestOtp.isPending}
		>
			{requestOtp.isPending ? 'Sending…' : 'Resend code'}
		</Button>
	);
}
