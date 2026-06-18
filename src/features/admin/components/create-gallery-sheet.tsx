import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import InputNameIcon from '@/assets/input-name.svg?react';
import InputPhoneIcon from '@/assets/input-phone.svg?react';
import { SheetPage } from '@/components/sheet-page';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateGallery } from '@/features/admin/api/galleries';
import { type CreateGalleryFormData, createGallerySchema } from '@/features/admin/utils';
import { ApiError } from '@/lib/api';

interface CreateGallerySheetProps {
	open: boolean;
	onClose: () => void;
}

export function CreateGallerySheet({ open, onClose }: CreateGallerySheetProps) {
	const createGallery = useCreateGallery();
	const form = useForm<CreateGalleryFormData>({
		resolver: zodResolver(createGallerySchema),
		defaultValues: { phoneNumber: '', guestName: '' },
		mode: 'onSubmit',
	});

	const submit = form.handleSubmit(async (data) => {
		try {
			const gallery = await createGallery.mutateAsync({
				displayName: data.guestName.trim(),
				phoneNumber: data.phoneNumber.trim(),
			});
			toast.success(`Gallery created for ${gallery.displayName}`);
			form.reset();
			onClose();
		} catch (err) {
			form.setError('phoneNumber', {
				message: err instanceof ApiError && err.message ? err.message : 'Failed to create gallery',
			});
		}
	});

	const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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
	const nameError = form.formState.errors.guestName?.message;

	return (
		<SheetPage open={open} onClose={onClose}>
			<form onSubmit={submit}>
				<Title as="h2" size="sm">
					Add guest gallery
				</Title>
				<Card rounded="lg" className="gap-2 mt-8">
					<p className="text-muted-foreground mb-2">Guest Info</p>
					<div className="flex flex-col gap-2">
						<Input
							id="create-gallery-name"
							type="text"
							autoComplete="name"
							placeholder="Full name"
							startIcon={<InputNameIcon />}
							aria-invalid={Boolean(nameError)}
							{...form.register('guestName')}
						/>
						{nameError ? (
							<p className="text-sm text-destructive" role="alert">
								{nameError}
							</p>
						) : null}
					</div>
					<div className="flex flex-col gap-2">
						<Input
							id="create-gallery-phone"
							type="tel"
							inputMode="tel"
							autoComplete="tel"
							placeholder="Phone number"
							startIcon={<InputPhoneIcon />}
							aria-invalid={Boolean(phoneError)}
							onPaste={handlePhonePaste}
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
						disabled={createGallery.isPending || form.formState.isSubmitting}
						className="mt-2"
					>
						{createGallery.isPending ? 'Adding…' : 'Add gallery'}
					</Button>
				</Card>
			</form>
		</SheetPage>
	);
}
