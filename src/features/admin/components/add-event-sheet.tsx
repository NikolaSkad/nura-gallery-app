import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { SheetPage } from '@/components/sheet-page';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
	type EventParticipant,
	useAdminEventsSearch,
	useEventParticipants,
} from '@/features/admin/api/events';
import { type AddEventFormData, addEventSchema } from '@/features/admin/utils';

interface AddEventSheetProps {
	open: boolean;
	onClose: () => void;
}

function getParticipantLabel(participant: EventParticipant): string {
	if (participant.isPlusOne) {
		return participant.plusOneName || participant.plusOnePhoneNumber || 'Plus one';
	}
	return participant.user.fullName || participant.user.phoneNumber || 'Unknown participant';
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
		defaultValues: { eventId: '', participantIds: [] },
		mode: 'onSubmit',
	});

	const selectedEventId = form.watch('eventId');
	const participants = useEventParticipants(selectedEventId || undefined);
	const participantOptions = useMemo(
		() =>
			participants.data?.map((participant) => ({
				value: participant.id,
				label: getParticipantLabel(participant),
			})) ?? [],
		[participants.data],
	);
	const participantsEmptyText = !selectedEventId
		? 'Choose an event first'
		: participants.isError
			? "Couldn't load participants"
			: 'No participants found';

	const submit = form.handleSubmit(() => {
		// Stub: the bulk-attach endpoint isn't built yet.
		// When it lands, replace this with the mutation call passing { eventId, participantIds }.
		form.reset();
		onClose();
	});

	const eventError = form.formState.errors.eventId?.message;
	const participantsError = form.formState.errors.participantIds?.message;

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
										form.setValue('participantIds', []);
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
							name="participantIds"
							render={({ field }) => (
								<SearchableMultiSelect
									id="add-event-participants"
									options={participantOptions}
									value={field.value}
									onValueChange={field.onChange}
									placeholder="Choose participants"
									searchPlaceholder="Search participants…"
									emptyText={participantsEmptyText}
									loading={Boolean(selectedEventId) && participants.isPending}
									disabled={!selectedEventId}
									aria-invalid={Boolean(participantsError)}
								/>
							)}
						/>
						{participantsError ? (
							<p className="text-sm text-destructive" role="alert">
								{participantsError}
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
