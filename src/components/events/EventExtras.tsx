"use client";

/**
 * Free, no-payment flows on the generic event page (November Open, Release 1):
 *   - Request a Doubles Partner (a request, not a registration)
 *   - Join the waitlist of a full category
 *
 * Neither creates an order or payment link. Consent is required (tournament rules, Terms &
 * Privacy); promotional email is a SEPARATE, optional, unchecked-by-default opt-in and is
 * never a condition of anything here.
 */
import { useRef, useState, type FormEvent } from "react";

import {
  joinEventWaitlist,
  requestEventPartner,
  type EventPersonGender,
  type PublicTournamentCategory,
} from "@/lib/api";
import { friendlyError } from "@/lib/friendly-error";

const ORIGIN = "/pc-november-open-implementation-preview";
const input =
  "w-full rounded-lg border border-grey-800 bg-grey-950 px-3 py-2.5 text-base text-white placeholder:text-grey-600 focus:border-volt focus:outline-none";
const label = "pc-label text-grey-400";
const link = "text-volt underline underline-offset-2";

type Fields = { name: string; phone: string; email: string; duprId: string; rating: string; gender: EventPersonGender | "" };
const empty: Fields = { name: "", phone: "+91", email: "", duprId: "", rating: "", gender: "" };

function validate(f: Fields, cap: number | null, needGender: boolean): string | null {
  if (!f.name.trim()) return "Enter your full name.";
  if (f.phone.replace(/\D/g, "").length < 10) return "Enter a valid mobile number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return "Enter a valid email address.";
  if (!f.duprId.trim()) return "Your DUPR ID is required.";
  const r = Number.parseFloat(f.rating);
  if (!Number.isFinite(r)) return "Enter your DUPR rating, for example 3.45.";
  if (cap != null && r > cap) return `This category needs DUPR ${cap} or below.`;
  if (needGender && !f.gender) return "Select your gender.";
  return null;
}

function Consent({ agreed, setAgreed, marketing, setMarketing }: { agreed: boolean; setAgreed: (v: boolean) => void; marketing: boolean; setMarketing: (v: boolean) => void }) {
  return (
    <div className="space-y-2">
      <label className="flex items-start gap-2.5 text-sm text-grey-200">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 accent-[#C8F400]" />
        <span>
          I agree to the tournament rules,{" "}
          <a href={`${ORIGIN}/terms`} target="_blank" rel="noopener noreferrer" className={link}>
            Terms &amp; Conditions
          </a>{" "}
          and{" "}
          <a href={`${ORIGIN}/privacy`} target="_blank" rel="noopener noreferrer" className={link}>
            Privacy Policy
          </a>
          . *
        </span>
      </label>
      <label className="flex items-start gap-2.5 text-sm text-grey-200">
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 h-4 w-4 accent-[#C8F400]" />
        <span>
          I&apos;d like to receive tournament news, offers and promotional emails from Pickleball Central. I can unsubscribe at any
          time. <span className="text-grey-400">(Optional — not needed for anything on this page.)</span>
        </span>
      </label>
    </div>
  );
}

function PlayerFields({ f, set, gender }: { f: Fields; set: (p: Partial<Fields>) => void; gender?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={label}>Full name *</label>
        <input className={input} value={f.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" />
      </div>
      <div>
        <label className={label}>Mobile number *</label>
        <input className={input} value={f.phone} onChange={(e) => set({ phone: e.target.value })} inputMode="tel" autoComplete="tel" />
      </div>
      <div>
        <label className={label}>Email *</label>
        <input className={input} type="email" value={f.email} onChange={(e) => set({ email: e.target.value })} autoComplete="email" />
      </div>
      <div>
        <label className={label}>DUPR ID *</label>
        <input className={input} value={f.duprId} onChange={(e) => set({ duprId: e.target.value })} autoCapitalize="characters" />
      </div>
      <div>
        <label className={label}>DUPR rating *</label>
        <input className={input} value={f.rating} onChange={(e) => set({ rating: e.target.value })} inputMode="decimal" placeholder="e.g. 3.45" />
      </div>
      {gender ? (
        <div>
          <label className={label}>Gender *</label>
          <select className={input} value={f.gender} onChange={(e) => set({ gender: e.target.value as EventPersonGender | "" })}>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      ) : null}
    </div>
  );
}

function usePatch(): [Fields, (p: Partial<Fields>) => void] {
  const [f, setF] = useState<Fields>(empty);
  return [f, (p) => setF((prev) => ({ ...prev, ...p }))];
}

function PartnerRequest({ slug, category }: { slug: string; category: PublicTournamentCategory }) {
  const [f, set] = usePatch();
  const [agreed, setAgreed] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const key = useRef(crypto.randomUUID());

  async function submit(e: FormEvent) {
    e.preventDefault();
    const bad = validate(f, category.dupr_cap_max, false) ?? (agreed ? null : "Please agree to the tournament rules, Terms & Conditions and Privacy Policy.");
    if (bad) return setError(bad);
    setBusy(true);
    setError(null);
    try {
      const r = await requestEventPartner({
        slug,
        idempotencyKey: key.current,
        body: {
          category_id: category.id,
          registrant: { full_name: f.name.trim(), phone: f.phone.replace(/\s+/g, ""), email: f.email.trim(), dupr_id: f.duprId.trim(), dupr_rating: Number.parseFloat(f.rating) },
          terms_accepted: true,
          ...(marketing ? { marketing_opt_in: true } : {}),
        },
      });
      setDone(r.order);
    } catch (err) {
      key.current = crypto.randomUUID();
      setError(friendlyError(err, "Couldn’t send your request. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  if (done !== null) {
    return (
      <div className="rounded-lg border border-volt p-5">
        <p className="pc-label text-volt">Pairing request received</p>
        <p className="mt-2 text-grey-200">
          You haven&apos;t paid anything, and a pairing request does not guarantee a tournament slot. Preview only: no request was saved, no place is held and no message will be sent.
        </p>
      </div>
    );
  }
  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-4 rounded-lg border border-grey-800 bg-grey-950 p-5" noValidate>
      <h3 className="pc-label text-white">Request a doubles partner — free</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm text-grey-300">
        <li>Requesting a partner is free.</li>
        <li>Pairing is first-come, first-served and isn&apos;t guaranteed.</li>
        <li>We contact you if a suitable partner is found.</li>
        <li>Once you&apos;re paired and you both agree, the team fee is arranged later — nothing is charged now.</li>
        <li>A pairing request does not guarantee a tournament slot.</li>
      </ul>
      <PlayerFields f={f} set={set} />
      <Consent agreed={agreed} setAgreed={setAgreed} marketing={marketing} setMarketing={setMarketing} />
      {error ? <p role="alert" className="text-sm text-red-400">{error}</p> : null}
      <button type="submit" disabled={busy} className="w-full rounded-lg bg-volt px-4 py-3 font-semibold text-black disabled:opacity-60">
        {busy ? "Sending…" : "Send partner request"}
      </button>
    </form>
  );
}

function Waitlist({ slug, category }: { slug: string; category: PublicTournamentCategory }) {
  const doubles = category.play_type === "doubles";
  const [f, set] = usePatch();
  const [p, setP] = useState({ name: "", duprId: "", rating: "" });
  const [agreed, setAgreed] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const key = useRef(crypto.randomUUID());

  async function submit(e: FormEvent) {
    e.preventDefault();
    let bad = validate(f, category.dupr_cap_max, category.gender === "men" || category.gender === "women");
    if (!bad && doubles) {
      const r = Number.parseFloat(p.rating);
      if (!p.name.trim() || !p.duprId.trim() || !Number.isFinite(r)) bad = "Enter your partner's name, DUPR ID and rating.";
      else if (category.dupr_cap_max != null && r > category.dupr_cap_max) bad = `Your partner needs DUPR ${category.dupr_cap_max} or below.`;
    }
    if (!bad && !agreed) bad = "Please agree to the tournament rules, Terms & Conditions and Privacy Policy.";
    if (bad) return setError(bad);
    setBusy(true);
    setError(null);
    try {
      const r = await joinEventWaitlist({
        slug,
        idempotencyKey: key.current,
        body: {
          category_id: category.id,
          registrant: { full_name: f.name.trim(), phone: f.phone.replace(/\s+/g, ""), email: f.email.trim(), dupr_id: f.duprId.trim(), dupr_rating: Number.parseFloat(f.rating), ...(f.gender ? { gender: f.gender } : {}) },
          ...(doubles ? { partner: { full_name: p.name.trim(), dupr_id: p.duprId.trim(), dupr_rating: Number.parseFloat(p.rating) } } : {}),
          terms_accepted: true,
          ...(marketing ? { marketing_opt_in: true } : {}),
        },
      });
      setPosition(r.position);
    } catch (err) {
      key.current = crypto.randomUUID();
      setError(friendlyError(err, "Couldn’t join the waitlist. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  if (position !== null) {
    return (
      <div className="rounded-lg border border-volt p-5">
        <p className="pc-label text-volt">You&apos;re on the waitlist · #{position}</p>
        <p className="mt-2 text-grey-200">Nothing was charged and no spot is held. Preview only: no waitlist entry was saved and nobody will contact you.</p>
      </div>
    );
  }
  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-4 rounded-lg border border-grey-800 bg-grey-950 p-5" noValidate>
      <h3 className="pc-label text-white">This category is full — join the waitlist (free)</h3>
      <PlayerFields f={f} set={set} gender />
      {doubles ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className={label}>Partner&apos;s name *</label>
            <input className={input} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
          </div>
          <div>
            <label className={label}>Partner&apos;s DUPR ID *</label>
            <input className={input} value={p.duprId} onChange={(e) => setP({ ...p, duprId: e.target.value })} />
          </div>
          <div>
            <label className={label}>Partner&apos;s rating *</label>
            <input className={input} value={p.rating} onChange={(e) => setP({ ...p, rating: e.target.value })} inputMode="decimal" />
          </div>
        </div>
      ) : null}
      <Consent agreed={agreed} setAgreed={setAgreed} marketing={marketing} setMarketing={setMarketing} />
      {error ? <p role="alert" className="text-sm text-red-400">{error}</p> : null}
      <button type="submit" disabled={busy} className="w-full rounded-lg bg-volt px-4 py-3 font-semibold text-black disabled:opacity-60">
        {busy ? "Joining…" : "Join the waitlist"}
      </button>
    </form>
  );
}

export function EventExtras({ slug, categories }: { slug: string; categories: PublicTournamentCategory[] }) {
  const doubles = categories.find((c) => c.play_type === "doubles" && c.status === "open");
  const full = categories.filter((c) => c.waitlist_open === true && c.status === "open");
  if (!doubles && full.length === 0) return null;
  return (
    <div className="mt-8 space-y-6">
      {full.map((c) => (
        <Waitlist key={c.id} slug={slug} category={c} />
      ))}
      {doubles ? <PartnerRequest slug={slug} category={doubles} /> : null}
    </div>
  );
}
