import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRequestOtp } from '@/features/admin/api/auth';
import { type PhoneFormData, phoneSchema } from '@/features/admin/utils';

interface PhoneRequestFormProps {
	onSuccess: (phoneNumber: string) => void;
}

export function PhoneRequestForm({ onSuccess }: PhoneRequestFormProps) {
	const requestOtp = useRequestOtp();
	const form = useForm<PhoneFormData>({
		resolver: zodResolver(phoneSchema),
		defaultValues: { phoneNumber: '' },
		mode: 'onSubmit',
	});

	const submit = form.handleSubmit(async (data) => {
		const trimmed = data.phoneNumber.trim();
		try {
			await requestOtp.mutateAsync({ phoneNumber: trimmed });
			onSuccess(trimmed);
		} catch (err) {
			form.setError('phoneNumber', {
				message: extractApiMessage(err) ?? 'Failed to send verification code',
			});
		}
	});

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		// Normalize pasted phone numbers to E.164 — strip whitespace/formatting,
		// ensure a leading `+`. Treat a leading `00` (some non-US conventions) as
		// the international prefix.
		const pasted = e.clipboardData.getData('text');
		let digits = pasted.replace(/\D/g, '');
		if (!digits) return;
		if (digits.startsWith('00')) digits = digits.slice(2);
		e.preventDefault();
		form.setValue('phoneNumber', `+${digits}`, { shouldValidate: false });
	};

	const phoneError = form.formState.errors.phoneNumber?.message;

	return (
		<form onSubmit={submit} className="mx-auto flex w-full max-w-sm flex-col gap-6">
			<div className="flex flex-col gap-2 text-center">
				<Title>Admin sign in</Title>
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
					onPaste={handlePaste}
					{...form.register('phoneNumber')}
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
				fullWidth
				disabled={requestOtp.isPending || form.formState.isSubmitting}
			>
				{requestOtp.isPending ? 'Sending…' : 'Send code'}
			</Button>
		</form>
	);
}

function extractApiMessage(err: unknown): string | undefined {
	if (err instanceof Error && err.message) return err.message;
	return undefined;
}
