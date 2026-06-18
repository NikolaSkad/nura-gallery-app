import { Link } from '@tanstack/react-router';
import {
	ChevronRightIcon,
	LockIcon,
	MailIcon,
	MessageCircleIcon,
	MessageSquareIcon,
	PhoneIcon,
} from 'lucide-react';

const CONTACT_PHONE = '17189808057';
const CONTACT_PHONE_DISPLAY = '+1 (718) 980-8057';
const CONTACT_EMAIL = 'shraga@nuraevents.com';

const CONTACTS = [
	{
		label: 'Message us',
		destination: CONTACT_PHONE_DISPLAY,
		href: `sms:+${CONTACT_PHONE}`,
		icon: MessageSquareIcon,
	},
	{
		label: 'WhatsApp',
		destination: CONTACT_PHONE_DISPLAY,
		href: `https://wa.me/${CONTACT_PHONE}`,
		external: true,
		icon: MessageCircleIcon,
	},
	{
		label: 'Email us',
		destination: CONTACT_EMAIL,
		href: `mailto:${CONTACT_EMAIL}`,
		icon: MailIcon,
	},
	{
		label: 'Call us',
		destination: CONTACT_PHONE_DISPLAY,
		href: `tel:+${CONTACT_PHONE}`,
		icon: PhoneIcon,
	},
];

export function Home() {
	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-between gap-12 px-6 py-12 text-primary">
			<div />
			<header className="flex flex-col items-center gap-4 text-center">
				<h1 className="text-5xl leading-none tracking-wide text-primary">Nura Gallery</h1>
				<p className="text-base leading-6">
					Your event photos are private and accessible only through your personal gallery link.
				</p>
			</header>

			<section className="flex flex-col gap-5">
				<p className="text-center text-xs tracking-[0.25em] uppercase">Don't have a link yet</p>
				<ul className="divide-y divide-border border-border border-y">
					{CONTACTS.map((contact) => {
						const Icon = contact.icon;
						return (
							<li key={contact.label}>
								<a
									href={contact.href}
									{...(contact.external && {
										target: '_blank',
										rel: 'noreferrer',
									})}
									className="group flex touch-manipulation items-center gap-4 px-1 py-4 transition-colors duration-150 [-webkit-tap-highlight-color:transparent] hover:bg-card/50 active:bg-card/50"
								>
									<span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border transition-colors duration-150 group-hover:border-primary/50 group-active:border-primary/50">
										<Icon aria-hidden="true" className="size-4" />
									</span>
									<span className="flex flex-1 flex-col gap-0.5">
										<span className="text-sm ">{contact.label}</span>
										<span className="text-xs text-muted-foreground">{contact.destination}</span>
									</span>
									<ChevronRightIcon
										aria-hidden="true"
										className="size-4 text-muted-foreground transition-colors duration-150"
									/>
								</a>
							</li>
						);
					})}
				</ul>
			</section>

			<Link
				to="/admin/login"
				className="group flex touch-manipulation items-center justify-center gap-2 self-center py-2 text-xs tracking-[0.25em] uppercase transition-colors duration-150 [-webkit-tap-highlight-color:transparent] hover:text-primary/70 active:text-primary/70"
			>
				<LockIcon aria-hidden="true" className="size-3" />
				<span>Log in as admin</span>
			</Link>
		</main>
	);
}
