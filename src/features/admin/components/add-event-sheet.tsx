import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { SheetPage } from '@/components/sheet-page';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useAdminEventsSearch } from '@/features/admin/api/events';
import { type AddEventFormData, addEventSchema } from '@/features/admin/utils';

interface AddEventSheetProps {
	open: boolean;
	onClose: () => void;
}

export function AddEventSheet({ open, onClose }: AddEventSheetProps) {
	const events = useAdminEventsSearch({ limit: 100 });
	const eventOptions = useMemo(
		() => events.data?.events.map((event) => ({ value: event.id, label: event.name })) ?? [],
		[events.data],
	);
	const eventsEmptyText = events.isError ? "Couldn't load events" : 'No events found';

	const form = useForm<AddEventFormData>({
		resolver: zodResolver(addEventSchema),
		defaultValues: { eventId: '', participantId: '' },
		mode: 'onSubmit',
	});

	const submit = form.handleSubmit(() => {
		// Wiring lands here once the events/participants endpoints exist.
		// Until then this just validates and closes the sheet.
		form.reset();
		onClose();
	});

	const selectedEventId = form.watch('eventId');
	const eventError = form.formState.errors.eventId?.message;
	const participantError = form.formState.errors.participantId?.message;

	return (
		<SheetPage open={open} onClose={onClose}>
			<form onSubmit={submit}>
				<Title as="h2" size="sm">
					Add event
				</Title>
				<Card rounded="lg" className="mt-8 gap-2">
					<p className="mb-2 text-muted-foreground">Event Info</p>
					<div className="flex flex-col gap-2">
						<Controller
							control={form.control}
							name="eventId"
							render={({ field }) => (
								<SearchableSelect
									id="add-event-event"
									options={eventOptions}
									value={field.value || undefined}
									onValueChange={(next) => {
										field.onChange(next);
										form.setValue('participantId', '');
									}}
									placeholder="Choose event"
									searchPlaceholder="Search events…"
									emptyText={eventsEmptyText}
									loading={events.isPending}
									aria-invalid={Boolean(eventError)}
								/>
							)}
						/>
						{eventError ? (
							<p className="text-sm text-destructive" role="alert">
								{eventError}
							</p>
						) : null}
					</div>
					<div className="flex flex-col gap-2">
						<Controller
							control={form.control}
							name="participantId"
							render={({ field }) => (
								<SearchableSelect
									id="add-event-participant"
									options={[]}
									value={field.value || undefined}
									onValueChange={field.onChange}
									placeholder="Choose participant"
									searchPlaceholder="Search participants…"
									emptyText={
										selectedEventId ? 'No participants available' : 'Choose an event first'
									}
									disabled={!selectedEventId}
									aria-invalid={Boolean(participantError)}
								/>
							)}
						/>
						{participantError ? (
							<p className="text-sm text-destructive" role="alert">
								{participantError}
							</p>
						) : null}
					</div>
					<Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="mt-2">
						Add event
					</Button>
				</Card>
			</form>
		</SheetPage>
	);
}
