import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { SearchableSelectOption } from '@/components/ui/searchable-select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface SearchableMultiSelectProps {
	options: SearchableSelectOption[];
	value?: string[];
	onValueChange?: (value: string[]) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	loading?: boolean;
	disabled?: boolean;
	'aria-invalid'?: boolean;
	id?: string;
}

export function SearchableMultiSelect({
	options,
	value = [],
	onValueChange,
	placeholder = 'Select…',
	searchPlaceholder = 'Search…',
	emptyText = 'No matches',
	loading = false,
	disabled,
	id,
	'aria-invalid': ariaInvalid,
}: SearchableMultiSelectProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return options;
		return options.filter((option) => option.label.toLowerCase().includes(query));
	}, [options, search]);

	const selectedSet = useMemo(() => new Set(value), [value]);

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) setSearch('');
	};

	const toggle = (optionValue: string) => {
		if (selectedSet.has(optionValue)) {
			onValueChange?.(value.filter((v) => v !== optionValue));
		} else {
			onValueChange?.([...value, optionValue]);
		}
	};

	const triggerLabel = (() => {
		if (value.length === 0) return placeholder;
		if (value.length === 1) {
			return options.find((option) => option.value === value[0])?.label ?? placeholder;
		}
		return `${value.length} selected`;
	})();

	return (
		<Popover open={open} onOpenChange={handleOpenChange} modal={false}>
			<PopoverTrigger asChild>
				<button
					id={id}
					type="button"
					role="combobox"
					aria-expanded={open}
					aria-invalid={ariaInvalid}
					disabled={disabled}
					className={cn(
						'flex w-full min-w-0 items-center justify-between gap-2 rounded-full bg-input/40 px-4 py-3.5 text-left text-base text-primary outline-none transition-colors',
						'focus-visible:bg-input/60',
						'aria-invalid:ring-2 aria-invalid:ring-destructive/60',
						'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
					)}
				>
					<span className={cn('truncate', value.length === 0 && 'text-tertiary')}>
						{triggerLabel}
					</span>
					<ChevronDownIcon
						className={cn(
							'size-5 shrink-0 text-primary transition-transform',
							open && 'rotate-180',
						)}
					/>
				</button>
			</PopoverTrigger>
			<PopoverContent className="flex flex-col gap-2 p-2">
				<input
					type="text"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder={searchPlaceholder}
					className="flex w-full shrink-0 rounded-full bg-input/40 px-3 py-2 text-sm text-primary outline-none placeholder:text-tertiary focus-visible:bg-input/60"
				/>
				{loading ? (
					<div className="flex flex-1 items-center justify-center py-6">
						<Spinner className="size-8" />
					</div>
				) : (
					<div className="max-h-64 min-h-0 shrink touch-pan-y overflow-y-auto overscroll-contain">
						<ul className="flex flex-col">
							{filtered.length === 0 ? (
								<li className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</li>
							) : (
								filtered.map((option) => {
									const isActive = selectedSet.has(option.value);
									return (
										<li key={option.value}>
											<button
												type="button"
												className={cn(
													'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors',
													'hover:bg-accent active:bg-accent',
													isActive && 'text-primary',
												)}
												onClick={() => toggle(option.value)}
											>
												<span className="truncate">{option.label}</span>
												{isActive ? <CheckIcon className="size-4 shrink-0" /> : null}
											</button>
										</li>
									);
								})
							)}
						</ul>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
