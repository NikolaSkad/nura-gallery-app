import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { SheetPage } from '@/components/sheet-page';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
	type EventParticipant,
	useAdminEventsSearch,
	useEventParticipants,
} from '@/features/admin/api/events';
import {
	type BulkAssignGalleryEventResult,
	useBulkAssignGalleryEvent,
} from '@/features/admin/api/galleries';
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

function getParticipantPhone(participant: EventParticipant): string | null {
	return participant.isPlusOne ? participant.plusOnePhoneNumber : participant.user.phoneNumber;
}

function buildResultMessage(result: BulkAssignGalleryEventResult): string {
	const touched = result.created + result.assigned;
	const skipped = result.skipped + result.errors.length;
	const parts: string[] = [];

	if (result.created > 0 && result.assigned > 0) {
		parts.push(`Created ${result.created}, attached to ${result.assigned} existing`);
	} else if (result.created > 0) {
		parts.push(`Created ${result.created} new galler${result.created === 1 ? 'y' : 'ies'}`);
	} else if (result.assigned > 0) {
		parts.push(
			`Attached to ${result.assigned} existing galler${result.assigned === 1 ? 'y' : 'ies'}`,
		);
	} else if (touched === 0 && skipped === 0) {
		parts.push('No changes');
	}

	if (skipped > 0) {
		parts.push(`${skipped} skipped`);
	}

	return parts.join(' · ');
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
		defaultValues: { eventId: '', participantIds: [], eventDisplayName: '' },
		mode: 'onSubmit',
	});

	const selectedEventId = form.watch('eventId');
	const participants = useEventParticipants(selectedEventId || undefined);
	const participantOptions = useMemo(
		() =>
			participants.data
				?.filter((participant) => getParticipantPhone(participant) !== null)
				.map((participant) => ({
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

	const bulkAssign = useBulkAssignGalleryEvent();

	const submit = form.handleSubmit(async (data) => {
		const lookup = new Map(participants.data?.map((p) => [p.id, p] as const) ?? []);
		const phoneNumbers = Array.from(
			new Set(
				data.participantIds
					.map((id) => lookup.get(id))
					.map((p) => (p ? getParticipantPhone(p) : null))
					.filter((phone): phone is string => Boolean(phone)),
			),
		);

		if (phoneNumbers.length === 0) {
			form.setError('participantIds', { message: 'Selected participants have no phone number' });
			return;
		}

		try {
			const trimmedDisplayName = data.eventDisplayName?.trim();
			const result = await bulkAssign.mutateAsync({
				eventId: data.eventId,
				phoneNumbers,
				eventDisplayName: trimmedDisplayName ? trimmedDisplayName : undefined,
			});
			toast.success(buildResultMessage(result));
			form.reset();
			onClose();
		} catch {
			toast.error('Failed to add event to galleries');
		}
	});

	const eventError = form.formState.errors.eventId?.message;
	const participantsError = form.formState.errors.participantIds?.message;
	const displayNameError = form.formState.errors.eventDisplayName?.message;

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
					<div className="flex flex-col gap-1">
						<Input
							id="add-event-display-name"
							type="text"
							placeholder="Event name shown in guest galleries (optional)"
							aria-invalid={Boolean(displayNameError)}
							{...form.register('eventDisplayName')}
						/>
						{displayNameError ? (
							<p className="text-sm text-destructive" role="alert">
								{displayNameError}
							</p>
						) : (
							<p className="px-1 text-xs text-muted-foreground">Defaults to the event's name.</p>
						)}
					</div>
					<Button
						type="submit"
						size="lg"
						disabled={bulkAssign.isPending || form.formState.isSubmitting}
						className="mt-2"
					>
						{bulkAssign.isPending ? 'Adding…' : 'Add event'}
					</Button>
				</Card>
			</form>
		</SheetPage>
	);
}
