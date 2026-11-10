/**
 * Marketing-side API client. Public endpoints only — no auth header,
 * no refresh-cookie dance. Used by the /play quick-booking widget.
 */
import { previewTransport } from "./preview-transport";

export class ApiHttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: string;
  readonly meta?: Record<string, unknown>;

  constructor(body: {
    status: number;
    code: string;
    detail: string;
    meta?: Record<string, unknown>;
  }) {
    super(body.detail);
    this.name = "ApiHttpError";
    this.status = body.status;
    this.code = body.code;
    this.detail = body.detail;
    if (body.meta !== undefined) this.meta = body.meta;
  }
}

async function publicFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  return await previewTransport(path, opts) as T;
}

export async function fetchPublicPaymentStatus(args: {
  paymentId: string;
  razorpayOrderId: string;
}): Promise<{
  id: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  booking_id: string | null;
  captured_at: string | null;
}> {
  return publicFetch(
    `/v1/payments/${args.paymentId}/public?order_id=${encodeURIComponent(args.razorpayOrderId)}`,
  );
}

// ===== S6-11: public tournament =====

export type PublicTournament = {
  id: string;
  name: string;
  slug: string;
  venue: string | null;
  venue_address: string | null;
  start_date: string;
  end_date: string;
  reg_open_at: string;
  reg_close_at: string;
  banner_storage_key: string | null;
  description: string | null;
  rules_md: string | null;
  prize_pool: number | null;
  status: "published" | "in_progress" | "completed";
  /** Admin closed the registration form — surfaces show a community CTA instead. */
  registration_closed?: boolean;
};

export type PublicTournamentCategory = {
  id: string;
  skill_level: "amateur" | "intermediate" | "advanced" | "open";
  gender: "men" | "women" | "mixed" | "open";
  play_type: "singles" | "doubles";
  pricing_mode: "per_head" | "per_team";
  entry_fee: number;
  early_bird_fee: number | null;
  early_bird_slots: number | null;
  early_bird_remaining: number | null;
  early_bird_active: boolean;
  current_price: number;
  dupr_cap_max: number | null;
  max_registrations: number;
  schedule_date: string | null;
  /** Reporting time, HH:mm IST. Categories of one event can differ. */
  start_time: string | null;
  status: string;
  confirmed_count: number;
  /** True once confirmed + invited + in-checkout entries fill the category (waitlist can be joined). */
  waitlist_open?: boolean;
};

/** The refund ladder the server will actually enforce on a cancellation. */
export type TournamentCancellationPolicy = {
  name: string;
  tiers: { min_hours_before: number; refund_percent: number }[];
};

export async function fetchPublicTournament(slug: string): Promise<{
  tournament: PublicTournament;
  categories: PublicTournamentCategory[];
  cancellation_policy?: TournamentCancellationPolicy | null;
} | null> {
  try {
    return await publicFetch<{
      tournament: PublicTournament;
      cancellation_policy?: TournamentCancellationPolicy | null;
      categories: PublicTournamentCategory[];
    }>(`/v1/tournaments/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof ApiHttpError && err.status === 404) return null;
    throw err;
  }
}

// ===== Public event registration (DUPR Night & friends) =====

export type EventRegisterResponse = {
  registration_id: string;
  registration_ids?: string[];
  status: "pending" | "confirmed";
  payment: {
    payment_id: string;
    razorpay_order_id: string;
    razorpay_key_id: string;
    amount_paise: number;
    currency: "INR";
  } | null;
  replayed: boolean;
};

export type EventPersonGender = "male" | "female" | "other";

export type EventUtm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  src?: string;
  ref?: string;
  landing?: string;
};

export type EventRegistrant = {
  full_name: string;
  phone: string;
  /** Optional. Carries the entry confirmation and the GST invoice. */
  email?: string;
  gender?: EventPersonGender;
  dupr_id?: string;
  dupr_rating?: number;
};

export async function registerForEvent(input: {
  slug: string;
  body: {
    category_id?: string;
    category_ids?: string[];
    team_name?: string;
    registrant: EventRegistrant;
    partner?: Partial<EventRegistrant>;
    /** Solo doubles entry — organiser pairs the player; partner omitted. */
    needs_partner?: boolean;
    self_declared_skill?: "amateur" | "intermediate" | "advanced" | "open";
    regular_at_pc?: boolean;
    terms_accepted?: boolean;
    coupon_code?: string;
    whatsapp_opt_in?: boolean;
    /** Promotional email only. Send it ONLY when the entrant ticked the box;
     *  the server records a consent timestamp when it is true. */
    marketing_opt_in?: boolean;
    utm?: EventUtm;
  };
  idempotencyKey: string;
}): Promise<EventRegisterResponse> {
  return publicFetch<EventRegisterResponse>(
    `/v1/public/events/${encodeURIComponent(input.slug)}/register`,
    {
      method: "POST",
      headers: { "Idempotency-Key": input.idempotencyKey },
      body: JSON.stringify(input.body),
    },
  );
}

export async function verifyEventPayment(input: {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  idempotencyKey: string;
}): Promise<{ status: "captured"; registration_ids: string[]; replayed: boolean }> {
  return publicFetch(`/v1/public/events/payments/verify`, {
    method: "POST",
    headers: { "Idempotency-Key": input.idempotencyKey },
    body: JSON.stringify({
      payment_id: input.paymentId,
      razorpay_order_id: input.razorpayOrderId,
      razorpay_payment_id: input.razorpayPaymentId,
      razorpay_signature: input.razorpaySignature,
    }),
  });
}

// ===== Release 1: free waitlist + partner request (no payment, no notification) =====

export type EventPlayerInput = {
  full_name: string;
  phone: string;
  email: string;
  gender?: EventPersonGender;
  dupr_id: string;
  dupr_rating: number;
};

export async function joinEventWaitlist(input: {
  slug: string;
  body: {
    category_id: string;
    registrant: EventPlayerInput;
    partner?: { full_name: string; dupr_id: string; dupr_rating: number };
    terms_accepted: boolean;
    marketing_opt_in?: boolean;
  };
  idempotencyKey: string;
}): Promise<{ registration_id: string; status: "waitlisted"; position: number; payment: null }> {
  return publicFetch(`/v1/public/events/${encodeURIComponent(input.slug)}/waitlist`, {
    method: "POST",
    headers: { "Idempotency-Key": input.idempotencyKey },
    body: JSON.stringify(input.body),
  });
}

export async function requestEventPartner(input: {
  slug: string;
  body: {
    category_id: string;
    registrant: EventPlayerInput;
    terms_accepted: boolean;
    marketing_opt_in?: boolean;
  };
  idempotencyKey: string;
}): Promise<{ request_id: string; status: "awaiting_partner"; order: number; payment: null }> {
  return publicFetch(`/v1/public/events/${encodeURIComponent(input.slug)}/partner-request`, {
    method: "POST",
    headers: { "Idempotency-Key": input.idempotencyKey },
    body: JSON.stringify(input.body),
  });
}
