"use client";

/**
 * Inline, account-optional event registration + Razorpay checkout.
 *
 * Powers the generic /events/[slug] pages (events without a bespoke page —
 * bespoke Season 5 / DUPR Night forms live in their own components but the
 * generic route can serve those events too). Posts to the public register
 * endpoint (no login), then opens Razorpay Checkout and confirms
 * SYNCHRONOUSLY from the Checkout success handler (same as the bespoke
 * forms — the events flow has no webhook), with the status poll kept as a
 * backup. Collects gender + T&C + full partner details so per_team
 * categories (Season 5) work here too; DUPR ID + rating are mandatory.
 * Fires Meta Pixel funnel events on the existing site-wide `fbq`.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { readUtm, track } from "@/lib/analytics";
import {
  fetchPublicPaymentStatus,
  registerForEvent,
  verifyEventPayment,
  type EventPersonGender,
  type EventRegisterResponse,
  type PublicTournamentCategory,
  type TournamentCancellationPolicy,
} from "@/lib/api";
import { friendlyError } from "@/lib/friendly-error";

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 120_000;

const SKILL_LABEL: Record<string, string> = {
  amateur: "Amateur",
  intermediate: "Intermediate",
  advanced: "Advanced",
  open: "Open",
};
const GENDER_LABEL: Record<string, string> = {
  men: "Men",
  women: "Women",
  mixed: "Mixed",
  open: "Open",
};
const PLAY_LABEL: Record<string, string> = { singles: "Singles", doubles: "Doubles" };

type RazorpayCheckout = { open: () => void; close: () => void };
type RazorpayCtor = new (opts: Record<string, unknown>) => RazorpayCheckout;

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    Razorpay?: RazorpayCtor;
    fbq?: (...args: unknown[]) => void;
  }
}

// Preview-only adapter: no Razorpay SDK, network or real orders.
async function loadRazorpay(): Promise<RazorpayCtor> {
  return (await import("@/lib/preview-checkout")).PreviewCheckout;
}

function catLabel(c: PublicTournamentCategory): string {
  return `${PLAY_LABEL[c.play_type] ?? c.play_type} ${SKILL_LABEL[c.skill_level] ?? c.skill_level} ${GENDER_LABEL[c.gender] ?? c.gender}`;
}

/**
 * Renders the refund ladder the server will actually apply, in plain words.
 *
 * Driven entirely by `cancellation_policies` (applies_to='tournament'), which
 * is the same row the cancel route resolves against — so the page cannot
 * promise terms the backend would not honour. Returns null when no policy
 * came back, and the caller then points at the Terms rather than inventing a
 * ladder.
 */
function describeRefundTiers(
  policy: TournamentCancellationPolicy | null | undefined,
): string | null {
  if (!policy || policy.tiers.length === 0) return null;
  const sorted = [...policy.tiers].sort((a, b) => b.min_hours_before - a.min_hours_before);
  const parts = sorted.map(({ min_hours_before: hours, refund_percent: pct }) => {
    const amount = pct === 100 ? "full refund" : pct === 0 ? "no refund" : `${pct}% refund`;
    if (hours === 0) return `${amount} after that`;
    const window =
      hours % 24 === 0
        ? `${hours / 24} day${hours / 24 === 1 ? "" : "s"}`
        : `${hours} hour${hours === 1 ? "" : "s"}`;
    return `${amount} up to ${window} before the event`;
  });
  return `${parts.join(", ")}.`;
}

/** "18:00" -> "6 PM", "15:30" -> "3:30 PM". Already IST from the API. */
function hhmmToClock(hhmm: string): string {
  const [hRaw, mRaw] = hhmm.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const suffix = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${mRaw ?? "00"} ${suffix}`;
}

type Props = {
  slug: string;
  eventName: string;
  categories: PublicTournamentCategory[];
  /** The refund ladder the server will enforce; omitted when none is set. */
  cancellationPolicy?: TournamentCancellationPolicy | null;
};

export function EventRegister({ slug, eventName, categories, cancellationPolicy }: Props) {
  const firstOpen = categories.find((c) => c.max_registrations - c.confirmed_count > 0);
  const [categoryId, setCategoryId] = useState(firstOpen?.id ?? categories[0]?.id ?? "");
  const selected = categories.find((c) => c.id === categoryId);
  const isDoubles = selected?.play_type === "doubles";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+91");
  const [gender, setGender] = useState<EventPersonGender | "">("");
  const [duprId, setDuprId] = useState("");
  const [duprRating, setDuprRating] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("+91");
  const [partnerGender, setPartnerGender] = useState<EventPersonGender | "">("");
  const [email, setEmail] = useState("");
  // Transactional: carries the entry confirmation. NOT a promotional consent.
  const [whatsapp, setWhatsapp] = useState(true);
  const [accepted, setAccepted] = useState(false);
  // Promotional email. Separate, optional, unchecked by default — the server
  // records a consent timestamp only when this is sent as true.
  const [marketing, setMarketing] = useState(false);
  const refundSentence = describeRefundTiers(cancellationPolicy);

  const [stage, setStage] = useState<"form" | "pay" | "done" | "error">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resp, setResp] = useState<EventRegisterResponse | null>(null);
  const idemRef = useRef(crypto.randomUUID());

  const submit = useCallback(async () => {
    if (!selected) {
      setError("Pick a category.");
      return;
    }
    if (!fullName.trim() || phone.trim().replace(/\D/g, "").length < 6) {
      setError("Enter your name and a valid phone number.");
      return;
    }
    if (!gender) {
      setError("Select your gender.");
      return;
    }
    const ratingNum = Number.parseFloat(duprRating);
    if (!duprId.trim() || !(duprRating.trim() !== "" && Number.isFinite(ratingNum))) {
      setError("Your DUPR ID and rating are required.");
      return;
    }
    if (selected.dupr_cap_max != null && ratingNum > selected.dupr_cap_max) {
      setError(`This category needs DUPR ${selected.dupr_cap_max} or below.`);
      return;
    }
    if (isDoubles) {
      if (!partnerName.trim() || partnerPhone.trim().replace(/\D/g, "").length < 6) {
        setError("Doubles needs your partner's name and phone number.");
        return;
      }
      if (!partnerGender) {
        setError("Select your partner's gender.");
        return;
      }
    }
    if (email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Enter a valid email address, or leave it blank.");
      return;
    }
    if (!accepted) {
      setError("Please agree to the tournament rules, Terms & Conditions and Privacy Policy.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const utm = readUtm();
      const r = await registerForEvent({
        slug,
        idempotencyKey: idemRef.current,
        body: {
          category_id: selected.id,
          registrant: {
            full_name: fullName.trim(),
            phone: phone.trim().replace(/\s+/g, ""),
            ...(email.trim() ? { email: email.trim() } : {}),
            gender,
            dupr_id: duprId.trim(),
            dupr_rating: ratingNum,
          },
          ...(isDoubles
            ? {
                // Auto-derived team name — required for per_team doubles,
                // ignored by per-head events.
                team_name: `${fullName.trim()} & ${partnerName.trim()}`.slice(0, 120),
                partner: {
                  full_name: partnerName.trim(),
                  phone: partnerPhone.trim().replace(/\s+/g, ""),
                  gender: partnerGender as EventPersonGender,
                },
              }
            : {}),
          terms_accepted: true,
          whatsapp_opt_in: whatsapp,
          // Sent only when ticked, so a blank box never records consent.
          ...(marketing ? { marketing_opt_in: true } : {}),
          ...(utm ? { utm } : {}),
        },
      });
      setResp(r);
      if (r.status === "confirmed" || !r.payment) {
        track("CompleteRegistration", { content_name: eventName, status: true });
        setStage("done");
        return;
      }
      track("InitiateCheckout", {
        value: r.payment.amount_paise / 100,
        currency: "INR",
        content_name: eventName,
      });
      setStage("pay");
    } catch (err) {
      setError(friendlyError(err, "Couldn’t complete your registration. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }, [
    selected,
    fullName,
    phone,
    gender,
    isDoubles,
    partnerName,
    partnerPhone,
    partnerGender,
    duprId,
    duprRating,
    whatsapp,
    accepted,
    email,
    marketing,
    slug,
    eventName,
  ]);

  // Pay stage: open Razorpay + poll the public status endpoint.
  useEffect(() => {
    if (stage !== "pay" || !resp?.payment) return;
    const payment = resp.payment;
    let cancelled = false;
    let pollTimer: number | null = null;
    const stopAt = Date.now() + POLL_TIMEOUT_MS;
    let checkout: RazorpayCheckout | null = null;

    // Synchronous confirmation from the Checkout success handler — the events
    // flow verifies the Razorpay signature server-side, no webhook needed.
    const confirm = async (rzp: {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    }) => {
      try {
        await verifyEventPayment({
          paymentId: payment.payment_id,
          razorpayOrderId: rzp.razorpay_order_id ?? payment.razorpay_order_id,
          razorpayPaymentId: rzp.razorpay_payment_id ?? "",
          razorpaySignature: rzp.razorpay_signature ?? "",
          idempotencyKey: crypto.randomUUID(),
        });
        if (cancelled) return;
        track("Purchase", {
          value: payment.amount_paise / 100,
          currency: "INR",
          content_name: eventName,
        });
        track("CompleteRegistration", { content_name: eventName, status: true });
        checkout?.close();
        setStage("done");
      } catch {
        if (cancelled) return;
        setError(
          "Preview simulation could not finish. No money was charged and no message was sent.",
        );
        setStage("error");
      }
    };

    void (async () => {
      try {
        const Razorpay = await loadRazorpay();
        if (cancelled) return;
        checkout = new Razorpay({
          key: payment.razorpay_key_id,
          order_id: payment.razorpay_order_id,
          amount: payment.amount_paise,
          currency: payment.currency,
          name: "Pickleball Central",
          description: eventName,
          prefill: { name: fullName, contact: phone },
          theme: { color: "#C8F400" },
          handler: (r: Record<string, string>) => void confirm(r),
          modal: {
            ondismiss: () => {
              // Fresh idempotency key: the registration + order behind the
              // old key already exist, so an EDITED retry would 409. A new
              // key makes the retry a fresh registration.
              idemRef.current = crypto.randomUUID();
              setError("Payment cancelled. You can try again.");
              setStage("form");
            },
          },
        });
        checkout.open();
      } catch (err) {
        setError(friendlyError(err, "Couldn’t start payment. Please try again."));
        setStage("error");
      }
    })();

    const tick = async () => {
      if (cancelled) return;
      try {
        const status = await fetchPublicPaymentStatus({
          paymentId: payment.payment_id,
          razorpayOrderId: payment.razorpay_order_id,
        });
        if (status.status === "captured") {
          track("Purchase", {
            value: payment.amount_paise / 100,
            currency: "INR",
            content_name: eventName,
          });
          track("CompleteRegistration", { content_name: eventName, status: true });
          checkout?.close();
          setStage("done");
          return;
        }
        if (status.status === "failed") {
          setError("Payment failed. Try again or use a different method.");
          setStage("error");
          checkout?.close();
          return;
        }
      } catch {
        // transient — keep polling
      }
      if (Date.now() > stopAt) {
        setError(
          "Preview simulation timed out. No registration, charge or message occurred.",
        );
        setStage("error");
        checkout?.close();
        return;
      }
      pollTimer = window.setTimeout(() => void tick(), POLL_INTERVAL_MS);
    };
    pollTimer = window.setTimeout(() => void tick(), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (pollTimer !== null) clearTimeout(pollTimer);
      checkout?.close();
    };
  }, [stage, resp, eventName, fullName, phone]);

  if (stage === "done") {
    return (
      <div className="rounded-lg border border-volt bg-grey-950 p-6">
        <p className="pc-label text-volt">Preview simulation</p>
        <h3 className="mt-2 text-xl font-medium text-white">Preview registration complete</h3>
        <p className="mt-2 text-sm text-grey-300">
          This was a local simulation for {eventName}. Nothing was submitted to{" "}
          any server. No spot was reserved and no message will be sent.
        </p>
      </div>
    );
  }

  const inputCls =
    "mt-1 w-full rounded-md border border-grey-800 bg-grey-900 px-3 py-2 text-white placeholder:text-grey-500 focus:border-volt focus:outline-none";

  return (
    <div className="rounded-lg border border-grey-800 bg-grey-950 p-6">
      <h3 className="text-xl font-medium text-white">Register</h3>

      {stage === "pay" ? (
        <p className="mt-4 text-sm text-grey-300">
          Opening the local preview checkout simulator. No payment provider is loaded. Choose a simulated outcome; nothing is submitted.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <label className="pc-label text-grey-400" htmlFor="evt-cat">
              Category
            </label>
            <select
              id="evt-cat"
              className={inputCls}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => {
                const remaining = c.max_registrations - c.confirmed_count;
                return (
                  <option key={c.id} value={c.id} disabled={remaining <= 0}>
                    {catLabel(c)} — ₹{c.entry_fee.toLocaleString("en-IN")}
                    {c.start_time === null ? "" : ` · report ${hhmmToClock(c.start_time)}`}
                    {remaining <= 0 ? " (Full)" : ""}
                  </option>
                );
              })}
            </select>
            {selected?.start_time == null ? null : (
              <p className="mt-2 text-sm text-grey-200">
                Report at <strong>{hhmmToClock(selected.start_time)}</strong> on the day.
                Categories of this event start at different times.
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="pc-label text-grey-400" htmlFor="evt-name">
                Your name
              </label>
              <input
                id="evt-name"
                className={inputCls}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="pc-label text-grey-400" htmlFor="evt-phone">
                Phone (WhatsApp)
              </label>
              <input
                id="evt-phone"
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91…"
                inputMode="tel"
              />
            </div>
          </div>

          <div>
            <label className="pc-label text-grey-400" htmlFor="evt-email">
              Email
            </label>
            <input
              id="evt-email"
              className={inputCls}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
            />
            <p className="mt-1 text-xs text-grey-500">
              Where we send your entry confirmation and GST invoice.
            </p>
          </div>

          <div>
            <label className="pc-label text-grey-400" htmlFor="evt-gender">
              Gender
            </label>
            <select
              id="evt-gender"
              className={inputCls}
              value={gender}
              onChange={(e) => setGender(e.target.value as EventPersonGender | "")}
            >
              <option value="">Select gender…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="pc-label text-grey-400" htmlFor="evt-dupr">
                DUPR ID
              </label>
              <input
                id="evt-dupr"
                className={inputCls}
                value={duprId}
                onChange={(e) => setDuprId(e.target.value)}
                placeholder="e.g. ABC123"
              />
            </div>
            <div>
              <label className="pc-label text-grey-400" htmlFor="evt-dupr-rating">
                DUPR rating
              </label>
              <input
                id="evt-dupr-rating"
                className={inputCls}
                value={duprRating}
                onChange={(e) => setDuprRating(e.target.value)}
                placeholder="e.g. 3.2"
                inputMode="decimal"
              />
            </div>
          </div>
          <p className="text-xs text-grey-500">
            DUPR ID &amp; rating are required — every match is DUPR-rated. No account? Create one
            free at{" "}
            <a
              href="https://dashboard.dupr.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-volt underline"
            >
              dupr.com
            </a>
            .
          </p>

          {isDoubles && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="pc-label text-grey-400" htmlFor="evt-pname">
                    Partner name
                  </label>
                  <input
                    id="evt-pname"
                    className={inputCls}
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Partner full name"
                  />
                </div>
                <div>
                  <label className="pc-label text-grey-400" htmlFor="evt-pphone">
                    Partner phone
                  </label>
                  <input
                    id="evt-pphone"
                    className={inputCls}
                    value={partnerPhone}
                    onChange={(e) => setPartnerPhone(e.target.value)}
                    placeholder="+91…"
                    inputMode="tel"
                  />
                </div>
              </div>
              <div>
                <label className="pc-label text-grey-400" htmlFor="evt-pgender">
                  Partner gender
                </label>
                <select
                  id="evt-pgender"
                  className={inputCls}
                  value={partnerGender}
                  onChange={(e) => setPartnerGender(e.target.value as EventPersonGender | "")}
                >
                  <option value="">Select gender…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          {/* Transactional. This is the channel the entry confirmation goes
              out on, not a promotional consent — the promotional opt-in is the
              separate, unchecked box below. */}
          <label className="flex items-start gap-2 text-sm text-grey-300">
            <input
              type="checkbox"
              className="mt-1"
              checked={whatsapp}
              onChange={(e) => setWhatsapp(e.target.checked)}
            />
            Send my entry confirmation and match-day updates for this tournament on WhatsApp.
          </label>

          {/* Required consent — same wording and the same two links as the
              waitlist and partner-request forms on this page. */}
          <label className="flex items-start gap-2 text-sm text-grey-300">
            <input
              type="checkbox"
              className="mt-1"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>
              I agree to the tournament rules,{" "}
              <a
                href="/pc-november-open-implementation-preview/terms/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-volt underline"
              >
                Terms &amp; Conditions
              </a>{" "}
              and{" "}
              <a
                href="/pc-november-open-implementation-preview/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-volt underline"
              >
                Privacy Policy
              </a>
              . *
            </span>
          </label>

          {/* Promotional — separate, optional, unchecked by default. */}
          <label className="flex items-start gap-2 text-sm text-grey-300">
            <input
              type="checkbox"
              className="mt-1"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
            />
            <span>
              I&apos;d like to receive tournament news, offers and promotional emails from
              Pickleball Central. I can unsubscribe at any time.{" "}
              <span className="text-grey-400">
                (Optional — not needed to enter this tournament.)
              </span>
            </span>
          </label>

          {selected && (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting}
              className="pc-label w-full rounded-md bg-volt px-4 py-3 text-black hover:bg-volt-dark disabled:opacity-60"
            >
              {submitting
                ? "Please wait…"
                : `Register & Pay ₹${selected.entry_fee.toLocaleString("en-IN")}`}
            </button>
          )}

          {selected && (
            <p className="text-center text-xs text-grey-600">
              ₹{selected.entry_fee.toLocaleString("en-IN")} is the full amount payable — GST
              included, no extra charges. Production uses Razorpay; payments are disabled in this preview.
              <span className="mt-1 block">
                {refundSentence === null ? (
                  <>
                    Cancellations and refunds follow the tournament cancellation policy in the{" "}
                    <a
                      href="/pc-november-open-implementation-preview/terms/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-grey-400 underline"
                    >
                      Terms &amp; Conditions
                    </a>
                    .
                  </>
                ) : (
                  <>
                    Cancellations: {refundSentence} See the{" "}
                    <a
                      href="/pc-november-open-implementation-preview/terms/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-grey-400 underline"
                    >
                      Terms &amp; Conditions
                    </a>
                    .
                  </>
                )}
              </span>
            </p>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}
