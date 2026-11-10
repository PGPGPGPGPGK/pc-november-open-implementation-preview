import { Container } from "@pc/ui";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { StateReview } from "@/components/PreviewTools";
import { EventExtras } from "@/components/events/EventExtras";
import { EventRegister } from "@/components/events/EventRegister";
import { EventRegistrationClosed } from "@/components/events/EventRegistrationClosed";
import { fetchPublicTournament } from "@/lib/api";

export const dynamic = "force-static";
export function generateStaticParams() { return [{slug:"november-2026"}]; }
// // ISR — revalidate every 60s.

// Events with a bespoke funnel page: the generic route redirects there so
// every deep link (e.g. the mobile app's tournament list, which builds
// /events/<slug> URLs) lands on the real registration experience.
// /events/dupr-night needs no entry — it IS a bespoke literal segment that
// shadows this dynamic route.
const BESPOKE_PAGES: Record<string, string> = {
  season5: "/october",
  season6: "/october",
  "october-2026": "/october",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchPublicTournament(slug);
  if (!data) return { title: "Event not found" };
  return {
    title: `${data.tournament.name} — Pickleball Central`,
    description:
      data.tournament.description?.slice(0, 160) ??
      `${data.tournament.name} at ${data.tournament.venue ?? "Pickleball Central"}.`,
    alternates: { canonical: `/events/${slug}` },
    openGraph: {
      title: data.tournament.name,
      description: data.tournament.description ?? undefined,
      url: `/events/${slug}`,
      type: "website",
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const bespoke = BESPOKE_PAGES[slug];
  if (bespoke) permanentRedirect(bespoke);
  const data = await fetchPublicTournament(slug);
  if (!data) notFound();
  const { tournament: t, categories } = data;

  return (
    <Container size="lg" className="py-12">
      <div className="grid gap-10 md:grid-cols-[1fr_24rem]">
        <div>
          <p className="pc-label text-volt">Event</p>
          <h1 className="pc-display mt-3 text-4xl text-white md:text-5xl">{t.name}</h1>
          <p className="mt-3 text-grey-400">
            {t.start_date}
            {t.end_date !== t.start_date ? ` → ${t.end_date}` : ""} ·{" "}
            {t.venue ?? "Pickleball Central"}
          </p>
          {t.prize_pool !== null && t.prize_pool > 0 && (
            <p className="mt-1 text-volt">Prize pool ₹{t.prize_pool.toLocaleString("en-IN")}</p>
          )}
          {t.description && (
            <p className="mt-6 max-w-2xl whitespace-pre-line text-grey-300">{t.description}</p>
          )}

          <h2 className="pc-label mt-10 text-grey-400">Categories</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {categories.map((c) => {
              const remaining = c.max_registrations - c.confirmed_count;
              return (
                <li key={c.id} className="rounded-lg border border-grey-800 bg-grey-950 p-4">
                  <p className="font-medium text-white">
                    {c.play_type} · {c.skill_level} · {c.gender}
                  </p>
                  <p className="mt-1 text-sm text-grey-400">
                    ₹{c.entry_fee.toLocaleString("en-IN")} ·{" "}
                    {remaining > 0 ? `${remaining} spots left` : "Full"}
                  </p>
                </li>
              );
            })}
          </ul>

          <p className="mt-10 text-xs text-grey-500">
            Registration closes {new Date(t.reg_close_at).toLocaleString("en-IN")}
          </p>
        </div>

        <aside>
          {t.registration_closed ? (
            <EventRegistrationClosed eventName={t.name} />
          ) : (
            <EventRegister
              slug={t.slug}
              eventName={t.name}
              categories={categories}
              cancellationPolicy={data.cancellation_policy ?? null}
            />
          )}
          {!t.registration_closed && <EventExtras slug={t.slug} categories={categories} />}
        </aside>
      </div>
      <StateReview />
    </Container>
  );
}
