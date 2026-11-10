/**
 * Turn any thrown error into a sentence a customer can understand.
 *
 * Our API returns human-written `detail` for domain errors (e.g. "That promo
 * code has expired."), but some responses carry technical text a user should
 * never read: AJV schema-validation messages (`code: "validation_error"`),
 * idempotency plumbing, `unknown` (non-JSON responses), 5xx, and raw
 * fetch/network failures. This helper suppresses those with clear guidance and
 * passes friendly domain `detail` through. Always returns a clean string.
 */
import { ApiHttpError } from "./api";

/** A few codes worth phrasing more warmly than the raw API detail. */
const CODE_MESSAGES: Record<string, string> = {
  slot_conflict: "That slot was just booked — please pick another.",
  slot_taken: "That slot was just booked — please pick another.",
  phone_in_use: "That phone number is on another account. Log in to book.",
  category_full: "This category just filled up — please pick another.",
  reg_window_closed: "Registration is closed for this event.",
  rate_limited: "You're doing that a bit too fast. Please wait a moment and try again.",
};

export function friendlyError(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (err instanceof ApiHttpError) {
    if (err.status >= 500 || err.code === "internal_error")
      return "Something went wrong on our end. Please try again in a moment.";
    if (err.status === 429 || err.code === "rate_limited") return CODE_MESSAGES.rate_limited!;

    const metaCode = typeof err.meta?.code === "string" ? err.meta.code : undefined;
    const code = metaCode ?? err.code;
    if (CODE_MESSAGES[code]) return CODE_MESSAGES[code];

    // Technical categories the customer must never see raw.
    if (code === "validation_error" || code === "unknown" || code.startsWith("idempotency"))
      return fallback;

    return err.detail?.trim() || fallback;
  }
  if (
    err instanceof Error &&
    /network|failed to fetch|load failed|timeout|timed out/i.test(err.message)
  )
    return "We couldn't reach the server. Check your connection and try again.";
  return fallback;
}
