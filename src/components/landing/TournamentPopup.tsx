// TournamentPopup — homepage announcement for the Pickleball Central Open,
// November 2026 (Sun 29 Nov 2026, Peerzadiguda).
//
// This is the ONLY surface in the site that wears the promotional palette —
// a light cream card against the dark homepage. The homepage behind it, the
// navigation, the footer and the tournament registration page all keep the
// existing Pickleball Central colours. See PROMO_VARS below.
//
// Behaviour (brief, Phase 7):
//   • Surfaces ~2s after the homepage mounts.
//   • At most once per visitor per 24h (localStorage timestamp).
//   • Close button, backdrop click and Escape all dismiss it.
//   • Homepage only — it is mounted in app/page.tsx and nowhere else, so it
//     can never appear on /events/november-2026.
//   • Dialog semantics, focus moved in and trapped, focus restored on close.
//   • Background scroll locked while open.
//   • Honours prefers-reduced-motion (no slide/scale, no fade distance).
//   • Stops showing once registration has closed.
//
// No new dependency: framer-motion and next/link are already used site-wide.

"use client";

import { AnimatePresence, type MotionStyle, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * PROMOTIONAL PALETTE — popup only, approved 10 Nov 2026.
 *
 * Source of truth: `src/app/light/palette.css` in PGPGPGPGPGK/pc-november-open-preview
 * (--comparison-cream / -green / -soft-green / -pink / -charcoal).
 *
 * This is the campaign skin and it is deliberately unlike the rest of the
 * site: a light cream card against the dark homepage. It is scoped to this
 * component — the homepage behind it, the navigation, the footer and the
 * tournament registration page keep the existing Pickleball Central colours,
 * and no file other than this one carries these values.
 *
 * The two derived tokens (scrim, muted) are charcoal at reduced alpha rather
 * than new hues, so the palette stays five colours.
 */
const PROMO_VARS = {
  "--promo-cream": "#F8F6EF", // card background
  "--promo-green": "#285A43", // headings + primary button
  "--promo-soft-green": "#D9E8C5", // secondary surfaces
  "--promo-pink": "#F3A6C3", // highlights, badges, accents
  "--promo-charcoal": "#242C29", // body text
  "--promo-muted": "rgb(36 44 41 / 72%)", // charcoal, secondary weight
  "--promo-scrim": "rgb(36 44 41 / 82%)", // charcoal backdrop over the dark page
} as MotionStyle;

const STORAGE_KEY = "pc_november_open_popup_last_shown";
const SHOW_AFTER_MS = 2_000;
const ONCE_PER_MS = 24 * 60 * 60 * 1_000;

/** Registration closes Sat 28 Nov 2026, 11:59:59 PM IST. Matches seed-november-2026.ts. */
const HIDE_AFTER = Date.parse("2026-11-28T18:29:59.000Z");

/** The permanent production tournament URL — never the GitHub Pages preview. */
const REGISTER_URL = "/events/november-2026";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** localStorage throws in private mode / blocked-cookie browsers; never let that hide the popup. */
function lastShownAt(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? 0 : Number.parseInt(raw, 10) || 0;
  } catch {
    return 0;
  }
}

function markShown(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* no-op: the popup simply shows again next visit */
  }
}

export function TournamentPopup() {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  const close = useCallback(() => setOpen(false), []);

  // Surface once per 24h, 2s after mount, and never after the event closes.
  useEffect(() => {
    if (Date.now() > HIDE_AFTER) return;
    if (Date.now() - lastShownAt() < ONCE_PER_MS) return;

    const timer = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  // While open: record the impression, lock background scroll, move focus in,
  // and put it back where it was on close.
  useEffect(() => {
    if (!open) return;
    markShown();

    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusTo.current?.focus?.();
    };
  }, [open]);

  // Escape closes; Tab stays inside the dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || cardRef.current === null) return;
      const items = Array.from(cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (first === undefined || last === undefined) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const cardMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 24, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 24, scale: 0.96 },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="november-open-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={PROMO_VARS}
        >
          {/* Backdrop — click anywhere outside the card to dismiss. */}
          <button
            type="button"
            aria-label="Close announcement"
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 bg-[var(--promo-scrim)] backdrop-blur-sm"
          />

          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="november-open-popup-title"
            aria-describedby="november-open-popup-detail"
            {...cardMotion}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm rounded-2xl bg-[var(--promo-cream)] text-[var(--promo-charcoal)] shadow-2xl sm:max-w-md"
          >
            <button
              ref={closeRef}
              type="button"
              aria-label="Close announcement"
              onClick={close}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--promo-soft-green)] text-xl leading-none text-[var(--promo-charcoal)] transition-colors hover:bg-[var(--promo-pink)]"
            >
              <span aria-hidden="true">×</span>
            </button>

            <div className="px-6 py-8 text-center sm:px-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--promo-muted)]">
                Pickleball Central presents
              </p>

              <h2
                id="november-open-popup-title"
                className="mt-3 text-3xl font-black uppercase leading-[0.95] tracking-tight text-[var(--promo-green)] sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                November Open 2026
              </h2>

              <p
                className="mt-4 inline-block rounded-full bg-[var(--promo-pink)] px-4 py-1.5 text-lg font-black uppercase tracking-tight text-[var(--promo-charcoal)] sm:text-xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ₹30,000 prize pool
              </p>

              <div id="november-open-popup-detail" className="mt-5 space-y-1 text-sm">
                <p className="font-semibold text-[var(--promo-charcoal)]">29 November 2026</p>
                <p className="text-[var(--promo-muted)]">Peerzadiguda, Hyderabad</p>
              </div>

              <div className="mt-5 space-y-2 rounded-xl bg-[var(--promo-soft-green)] px-4 py-4 text-sm">
                <p className="flex items-center justify-between gap-4">
                  <span className="text-[var(--promo-muted)]">Open Singles</span>
                  <span className="font-mono tabular-nums font-semibold text-[var(--promo-green)]">₹799</span>
                </p>
                <p className="flex items-center justify-between gap-4">
                  <span className="text-[var(--promo-muted)]">Open Doubles</span>
                  <span className="font-mono tabular-nums font-semibold text-[var(--promo-green)]">
                    ₹1,599/team
                  </span>
                </p>
                <p className="border-t border-[var(--promo-cream)] pt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--promo-charcoal)]">
                  DUPR 3.7 &amp; below
                </p>
              </div>

              <Link
                href={REGISTER_URL}
                onClick={close}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--promo-green)] px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[var(--promo-cream)] transition-colors hover:bg-[var(--promo-charcoal)]"
              >
                Register now
                <span aria-hidden="true">→</span>
              </Link>

              <button
                type="button"
                onClick={close}
                className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--promo-muted)] transition-colors hover:text-[var(--promo-green)]"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
