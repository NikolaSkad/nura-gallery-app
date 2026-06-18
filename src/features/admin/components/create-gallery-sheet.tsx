import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { SheetPage } from '@/components/sheet-page';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type CreateGalleryFormData, createGallerySchema } from '@/features/admin/utils';

interface CreateGallerySheetProps {
	open: boolean;
	onClose: () => void;
}

export function CreateGallerySheet({ open, onClose }: CreateGallerySheetProps) {
	const form = useForm<CreateGalleryFormData>({
		resolver: zodResolver(createGallerySchema),
		defaultValues: { phoneNumber: '', guestName: '' },
		mode: 'onSubmit',
	});

	const submit = form.handleSubmit(() => {
		// Mutation lands here once the create-gallery endpoint exists. Until then,
		// validation runs and the sheet closes — wiring is one mutation hook away.
		form.reset();
		onClose();
	});

	const phoneError = form.formState.errors.phoneNumber?.message;
	const nameError = form.formState.errors.guestName?.message;

	return (
		<SheetPage open={open} onClose={onClose}>
			<form onSubmit={submit}>
				<Title as="h2" size="sm">
					Add guest gallery
				</Title>
				<Card padding="lg" rounded="lg" className="gap-5 mt-8">
					<div className="flex flex-col gap-2">
						<Label htmlFor="create-gallery-name" className="text-primary-foreground">
							Guest name
						</Label>
						<Input
							id="create-gallery-name"
							type="text"
							autoComplete="name"
							placeholder="Full name"
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
						<Label htmlFor="create-gallery-phone" className="text-primary-foreground">
							Phone number
						</Label>
						<Input
							id="create-gallery-phone"
							type="tel"
							inputMode="tel"
							autoComplete="tel"
							placeholder="+1 555 123 4567"
							aria-invalid={Boolean(phoneError)}
							{...form.register('phoneNumber')}
						/>
						{phoneError ? (
							<p className="text-sm text-destructive" role="alert">
								{phoneError}
							</p>
						) : null}
					</div>
					<Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
						Add gallery
					</Button>
				</Card>
			</form>
		</SheetPage>
	);
}
