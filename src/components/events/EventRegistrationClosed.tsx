/**
 * Shown in place of an event's registration form when an admin has closed
 * registration (the `registration_closed` toggle) — e.g. once the event has
 * started. Instead of a dead form, we point people at the WhatsApp community
 * for the schedule, updates and future events.
 *
 * Used by all three event surfaces: the generic /events/[slug] template, the
 * bespoke DUPR Night page, and the Season 5 page.
 */
const WHATSAPP_COMMUNITY_URL = "#preview-only";
const QUERIES_PHONE = "9700744634";

export function EventRegistrationClosed({ eventName }: { eventName?: string }) {
  return (
    <div className="rounded-2xl border border-volt/60 bg-navy-mid p-6 text-center sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-widest text-volt">
        Registrations closed
      </p>
      <h3 className="mt-2 font-display text-2xl text-white">
        {eventName ? `${eventName} is underway` : "Registration is closed"}
      </h3>
      <p className="mt-3 text-grey-200">
        Online registration is now closed. Join our WhatsApp community for the schedule, live
        updates and announcements about upcoming events.
      </p>
      <a
        href={WHATSAPP_COMMUNITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-4 py-4 font-display text-lg font-semibold uppercase tracking-wide text-black transition active:brightness-95"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        Join the WhatsApp Community
      </a>
      <p className="mt-3 text-xs text-grey-500">
        Queries?{" "}
        <a href="#preview-only" className="text-grey-300 underline">
          {QUERIES_PHONE}
        </a>
      </p>
    </div>
  );
}
