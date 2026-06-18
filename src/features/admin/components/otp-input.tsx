import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

interface OtpInputProps {
	length: number;
	value: string;
	onChange: (value: string) => void;
	autoFocus?: boolean;
}

export function OtpInput({ length, value, onChange, autoFocus }: OtpInputProps) {
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		if (autoFocus) inputRefs.current[0]?.focus();
	}, [autoFocus]);

	useEffect(() => {
		if (value === '') inputRefs.current[0]?.focus();
	}, [value]);

	const firstEmptyIndex = () => {
		for (let i = 0; i < length; i++) if (!value[i]) return i;
		return length - 1;
	};

	const handleChange = (index: number, raw: string) => {
		if (!/^\d*$/.test(raw)) return;
		const digit = raw.slice(-1);
		const next = value.split('');
		next[index] = digit;
		onChange(next.join(''));
		if (digit && index < length - 1) inputRefs.current[index + 1]?.focus();
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace' && !value[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pasted = e.clipboardData.getData('text').replaceAll(/\D/g, '').slice(0, length);
		if (!pasted) return;
		onChange(pasted);
		const nextIndex = Math.min(pasted.length, length - 1);
		inputRefs.current[nextIndex]?.focus();
	};

	const handleClick = (index: number, e: React.MouseEvent<HTMLInputElement>) => {
		const target = firstEmptyIndex();
		if (index > target) {
			e.preventDefault();
			inputRefs.current[target]?.focus();
		}
	};

	return (
		<div className="flex items-center justify-center gap-2 rounded-full bg-input/40 px-4 py-3.5">
			{Array.from({ length }).map((_, index) => {
				const digit = value[index] ?? '';
				return (
					<input
						// biome-ignore lint/suspicious/noArrayIndexKey: cell position is the identity
						key={index}
						ref={(el) => {
							inputRefs.current[index] = el;
						}}
						placeholder="—"
						type="tel"
						inputMode="numeric"
						maxLength={1}
						autoComplete="one-time-code"
						aria-label={`Digit ${index + 1}`}
						value={digit}
						onChange={(e) => handleChange(index, e.target.value)}
						onKeyDown={(e) => handleKeyDown(index, e)}
						onPaste={handlePaste}
						onClick={(e) => handleClick(index, e)}
						className={cn(
							'h-10 min-w-7 flex-1 bg-transparent text-center font-medium tracking-widest outline-none',
							digit ? 'text-foreground' : 'text-tertiary',
							'caret-primary placeholder:text-xl placeholder:leading-none focus-visible:text-primary',
						)}
					/>
				);
			})}
		</div>
	);
}
