# November Open implementation preview

**Preview only. No real registrations, payments, database, API, notifications or customer communications. Use fictional details.**

This independent personal repository copies the November Open implementation from source commit `caf37f445967881f3eff58d9acab24d5532989a5`. It is not connected to the production repository or VPS. `SOURCE_PROVENANCE.json` records original source paths and hashes.

## Routes

- `/pc-november-open-implementation-preview/`: existing homepage Hero and November announcement popup.
- `/pc-november-open-implementation-preview/events/november-2026/`: existing generic tournament page, EventRegister and EventExtras.
- Local copies of the existing Terms and Privacy pages, with contact actions disabled.

## Differences from the intended production implementation

1. All event information and capacities are synthetic fixtures. Fees are ₹799 Singles and ₹1,599 per Doubles team, GST inclusive; reporting times are 6 PM and 3 PM respectively. The existing tournament refund ladder is displayed from a fixture, without changing wording or rules.
2. Actual component JSX, form fields, validation, terms and optional promotional-consent wording are reused. Only the API transport and payment loader are replaced with local memory adapters. Submission buttons exercise the UI locally; they never send form data. No contact fields are retained by the adapter.
3. A clearly labelled simulator replaces Razorpay. It offers success, failure and cancellation. Success/response text explicitly describes a simulation. No card fields, payment SDK, keys, real orders or network payment calls exist.
4. The homepage preview includes the existing Hero and popup, not the full live homepage/nav/footer. Preview navigation and safety notices are additional. The popup's CTA leads to the copied registration page; a replay button resets only its local 24-hour display timestamp.
5. The existing approved `/light` palette layer is copied from the separate `pc-november-open-preview` repository. Small color mappings extend it to the generic form's grey classes; form geometry is unchanged. The current production-intended generic event form otherwise uses the dark site theme. Popup colors/geometry are unchanged.
6. Review-only controls show full-category/waitlist and closed-registration states. The original popup keeps its registration deadline and once-per-24-hours behavior; it will stop auto-showing after 28 November 2026, 23:59:59 IST.
7. The existing paid Doubles form collects partner name, phone and gender, and the entrant's DUPR ID/rating. It does not currently have partner DUPR fields; this preview preserves that implementation rather than inventing fields. The existing Doubles waitlist form does ask for partner DUPR ID/rating. Partner-request form is included.
8. Analytics/pixels are no-ops. Communication links are disabled; Terms/Privacy remain local. The external DUPR signup link remains a link, never an automatic request. Public logos and Google fonts are copied/bundled; hero CDN video is omitted because no CDN runtime configuration is used.
9. Static GitHub Pages base paths replace root-relative legal links. No environment files, customer data, production configurations or credentials are included. A restrictive CSP blocks external connections, payment scripts, frames and native form submissions. The fixture API has no fetch implementation or fallback URL. No form data persists after a page reload.

## Local preview

Node 22+; `npm ci`, `npm run build`, then `node scripts/serve-preview.cjs`. Open `http://localhost:3020/pc-november-open-implementation-preview/`.

The compiled `out/` files are published to this personal repository's `gh-pages` branch. Source is on `main`. There is no production deployment workflow.
