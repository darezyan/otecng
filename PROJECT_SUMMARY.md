# otecng — project summary (for continuing this build elsewhere)

Paste this whole file into a new Claude Code session (in this repo, after
`git clone` + `npm install`) to pick up where we left off.

## What this is

An ecommerce storefront called **otecng**, built with Next.js + Supabase.
It's a real product catalog: freezers, refrigerators, TVs, ACs, washing
machines, audio, cookers/microwaves, small appliances, power solutions, and
furniture, from five brands — **Hisense, LG, Maxi, Thermocool, Snowsea**.

The product data (names, prices, photos) is scraped from two real Nigerian
retail sites and re-hosted in our own Supabase Storage:
- **Hisense, LG, Maxi** — scraped from `fouanistore.com`, across every
  category they carry for those three brands.
- **Thermocool** — Fouani doesn't sell it; scraped from Jumia's Haier
  Thermocool brand store instead (also all categories).
- **Snowsea** — Fouani doesn't sell it either; scraped from Jumia, but
  **only their freezers** (that's the one brand where scope is
  freezers-only — everyone else is "all categories").

Beyond browsing (listing, filters, search, product detail pages with image
galleries), it now has **real ecommerce**: Add to Cart, a Buy Now shortcut,
and actual payment collection via Squad. **Still no user accounts** — that
was a deliberate choice (see the Cart/checkout section below), not an
oversight.

## Tech stack

- **Next.js 16** (App Router, Turbopack, Server Components do the data
  fetching directly)
- **TypeScript**, strict
- **Tailwind CSS v4**
- **shadcn/ui** — note: this project's shadcn setup uses **Base UI**
  under the hood, not Radix. Components take a `render={<Link .../>}` prop
  for polymorphism, not `asChild`. Check `components/ui/*.tsx` before
  assuming Radix conventions.
- **Supabase**: Postgres for data, Storage for images. Catalog tables
  (`brands`/`categories`/`products`/`product_images`) are RLS public-read-
  only; order tables (`orders`/`order_items`) have RLS with **no** public
  policies at all. All writes — catalog (import script) and orders (checkout
  API) — go through the service-role key server-side, never shipped to the
  client.
- Fonts: **Inter** (body) + **Plus Jakarta Sans** (headings, `font-heading`
  utility), both via `next/font/google`

## Database schema

Catalog — four tables, see `supabase/migrations/0001_init.sql`:
- `brands` (id, name, slug, logo_url)
- `categories` (id, name, slug) — created on demand by the import script,
  not hardcoded
- `products` (id, brand_id, category_id, name, slug, price, currency,
  description, source_url, created_at) — `source_url` is the original
  Fouani/Jumia URL, used for idempotent re-imports and provenance, not shown
  to shoppers
- `product_images` (id, product_id, url, position, is_primary)

RLS: anon key can `SELECT` on all four catalog tables, cannot write. Verified.

Orders — two more tables, `supabase/migrations/0002_orders.sql`:
- `orders` (id, status, payment_reference, total, currency, customer_*,
  delivery_*, paid_at, created_at) — guest checkout, no `user_id`
- `order_items` (id, order_id, product_id, product_name, product_price, qty)
  — `product_name`/`product_price` are snapshots at order time

RLS enabled on both, **zero policies** — not even public read. Everything
goes through the service-role key server-side (see the Cart/checkout section
below). Applied manually via the Supabase SQL editor, not the CLI — this
machine's `supabase` CLI login doesn't have access to the otecng project
(shows up in `supabase link` as a 403), so future schema changes here will
need the same manual-paste-into-SQL-editor approach unless that's fixed.

## The import pipeline (`scripts/import/`)

One-off scraping scripts, **not part of the app runtime**. Run via
`npm run seed`. Fully idempotent — re-running skips already-imported
products (matched by `source_url`) and only backfills what's missing.

- `fouani.ts` — fetches Fouani's category+brand-filtered listing pages.
  Their site embeds a full `__NEXT_DATA__` JSON blob per page (Next.js SSR
  payload) with clean product data including a multi-image gallery
  (`attachments`) — no per-product detail-page fetch needed, no headless
  browser needed, just `fetch()` + parse. Category IDs are hardcoded from
  their nav (see the `CATEGORIES` array) since there's no public category
  list API. **"Promotions" category is deliberately excluded** — it's
  marketing bundles, not real standalone products.
- `jumia.ts` — fetches Jumia's brand/category listing pages. Their site
  embeds `window.__STORE__` JSON (parsed with a hand-rolled
  `extractJsonAt` brace-matching scanner in `jsonScan.ts`, since it's not
  cleanly delimited). Listing pages only give a thumbnail; full image
  galleries + descriptions come from each product's own JSON-LD
  (`<script type="application/ld+json">`), fetched per-product with bounded
  concurrency (`pLimit`, see `concurrency.ts`).
  **Important gotcha we hit and fixed**: Jumia's listing pages sometimes mix
  in "related" products from *other* brands (e.g. Nexus/Aeon/Skyrun
  freezers showed up on the Snowsea freezers page and got mistagged as
  Snowsea). The code now cross-checks each listing item's own `brand` field
  against the expected brand before accepting it — don't remove that check.
  Category classification for Jumia items uses keyword matching against
  breadcrumbs *and* the product name, ordered most-specific-first (e.g. ACs
  before Audio) — an "AC Remote Control" accessory was getting
  miscategorized as Audio because Jumia's breadcrumb says "TV, Audio & Video
  Accessories" for all remotes.
- `storage.ts` — downloads each source image, re-uploads to the
  `product-images` Supabase Storage bucket (public, auto-created if
  missing), returns the public URL. Never hotlinks the original CDN.
- `seed.ts` — orchestrates both fetchers, resolves brand/category IDs
  (categories are upserted on first encounter, resolved sequentially before
  the concurrent import phase to avoid a race on the unique `slug`
  constraint), then imports products with bounded concurrency (6 at a
  time). Dedupes by `source_url` within a single run too (listing
  pagination can repeat items across pages).

Known state: **1,128 products, ~3,600 images** imported as of last run.
Exactly one product had zero images (all its image fetches failed
transiently on import) — found and manually repaired; if you spot another
imageless product, the fix is: look up its `source_url`, re-fetch, re-run
the same upload logic (see conversation history / `storage.ts`).

## Frontend structure

- `app/layout.tsx` — root layout, fonts, `<Header>` / `<Footer>`
- `app/page.tsx` — home: full-bleed dark hero (headline "Electronics Made
  Easy", 2×2 product-photo collage pulled from real inventory — one per
  category, brand-pinned for a couple of slots per explicit request: LG for
  the freezer tile, Hisense for the AC tile), brand chips, horizontally
  scrollable category rows (TVs/Refrigerators/Freezers/ACs), and a
  brand-diversified "Featured products" grid
- `app/products/page.tsx` — full listing: sidebar filters (category, price
  bracket, brand, and — refrigerators only — size bracket), windowed
  pagination (prev/next + ellipsis, not every page number), search results
  heading when `?q=` is present
- `app/products/[slug]/page.tsx` — product detail: image gallery
  (client-side thumbnail switching), price, description (cleaned of
  Fouani's "Related PDFs" markdown junk — see `cleanDescription` in
  `fouani.ts`), related products
- `components/Header.tsx` — **hand-rolled CSS hover mega-menu**, not
  shadcn's `NavigationMenu`. We tried the Base UI `NavigationMenu` first,
  but its auto-positioning anchors each dropdown to whichever trigger
  opened it, which fights the requirement "dropdown always spans the full
  nav width, starting from the nav's left edge, regardless of which item is
  hovered." Fixed by rendering each panel as `absolute inset-x-0 top-full`
  relative to **one shared `relative` ancestor** (the nav row container),
  with visibility toggled via Tailwind `group/item` + `group-hover`. Every
  priority category (TVs, Refrigerators, Freezers, ACs, Washing Machines)
  gets its own dropdown with a representative product photo + "Shop by
  brand" links; Refrigerators additionally gets a "By size" column.
  **`components/NavAutoClose.tsx`** fixes a follow-on bug: clicking a link
  inside an open panel navigates client-side without the mouse leaving the
  trigger, so the browser kept the panel's `:hover`/`:focus-within` alive
  after the route changed. Remounting on navigation (keying on pathname)
  did **not** fix it — Chromium can re-hit-test `:hover` onto a freshly
  mounted node at the same cursor position with no pointer movement. The
  actual fix: the instant a nav link is clicked, a `data-nav-suppressed`
  attribute force-hides every `.nav-panel` (CSS override in
  `app/globals.css`, `!important`), and the override only lifts on the next
  real `pointermove`. Verified with a real Playwright mouse-hover-then-click
  test, not just code inspection — the naive remount fix looked correct on
  paper but failed in an actual browser.
  `components/SearchBar.tsx` is a client component, submit-only (Enter or
  the button — NOT live-as-you-type, that was tried and explicitly
  rejected). **On submit it resets all other filter params** — an earlier
  bug let a stale category/brand filter silently zero-out unrelated
  searches.
- `components/ProductCard.tsx` — used everywhere (home, listing, related).
  Title is `line-clamp-2` — do **not** add an explicit `min-h-*` alongside
  it; that combination previously caused the clamp's clip boundary to land
  mid-line instead of after a clean 2 lines (visible as garbled/overlapping
  text). Price alignment across a row is handled via `mt-auto` on the price
  line instead.
- `components/FilterBar.tsx` — sidebar filters. Price and (for
  refrigerators) size are **range brackets** you click like checkboxes
  (see `PRICE_BRACKETS` / `REFRIGERATOR_SIZE_BRACKETS` in
  `lib/data/products.ts`), not exact-value lists — an early version listed
  every exact liter value for refrigerators and it was unusable (20+ tiny
  checkboxes).
- `lib/data/products.ts` — all Supabase read queries. Refrigerator size
  isn't a real column (no schema field for it) — it's parsed out of the
  product name via regex (`/\b(\d{2,4})L\b/`) at query time. Because that
  can't be pushed into SQL as a range filter, a size-bracket filter does an
  unpaginated fetch of the (already category/brand/price-narrowed)
  candidate set and paginates in memory — fine at this scale (~130
  refrigerators).
- Supabase clients are **untyped** (`createClient()` with no generic) —
  the hand-written `Database` type didn't carry the `Relationships`
  metadata the typed client wants for nested `select()` embeds, so results
  are cast via the `ProductWithRelations` type at the call site instead of
  fighting generated-type gymnastics.

## Cart, Buy Now, and checkout (Squad)

Guest checkout only — **no accounts, no sign-in flow.** This was a deliberate
call after briefly considering (and rejecting) required accounts: the
storefront doesn't need cross-device cart sync or saved addresses badly
enough to justify inventing an anonymous-session system just to have
something to key a database cart on.

- **Cart is client-side only** — `lib/cart/CartProvider.tsx`, a plain
  `useReducer` + React Context (no external state library), persisted to
  `localStorage["otecng:cart"]`. Initial reducer state is always `[]` so SSR
  and first client render match; the real read from `localStorage` happens
  in a `useEffect` after mount (`HYDRATE` action) to avoid a hydration
  mismatch. `useCart()` hook exposes `lines`, `count`, `subtotal`, `hydrated`,
  and `add`/`setQty`/`remove`/`clear`.
- **Buy Now** bypasses the cart entirely: `components/AddToCartButtons.tsx`
  writes a single line item to `sessionStorage["otecng:buyNow"]` (key
  exported as `BUY_NOW_STORAGE_KEY` from `lib/cart/types.ts`) and routes to
  `/checkout?mode=buynow`. `CheckoutForm` reads that instead of the real
  cart when the query param is present — the two never mix, so a Buy Now
  purchase can't accidentally check out unrelated items sitting in someone's
  cart.
- **Orders live in Postgres** (`supabase/migrations/0002_orders.sql`):
  `orders` + `order_items`, RLS enabled with **zero public policies** — every
  read/write goes through `lib/supabase/serviceClient.ts` (service-role key)
  from server-only code (`lib/data/orders.ts`, used only inside
  `app/api/**` and the callback page). `order_items` snapshot
  `product_name`/`product_price` at order time since prices can change and
  there's no product versioning.
- **Checkout flow**: `/checkout` (`CheckoutForm.tsx`) posts guest info +
  `{productId, qty}[]` to `POST /api/checkout`
  (`app/api/checkout/route.ts`), which **recomputes the total server-side**
  from current DB prices — it never trusts a price the client's cart
  snapshot sends. It creates the order as `status: 'pending'` *before*
  calling Squad's Initialize Transaction, so a record exists even if the
  customer abandons at Squad's page. Amounts sent to Squad are in
  **kobo** (`Math.round(total * 100)`) — that conversion is the one classic
  Squad integration bug, called out explicitly in `lib/squad.ts`.
- **Redirect/hosted integration, no client-side Squad SDK** —
  `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` doesn't exist and isn't needed, only
  `PAYSTACK_SECRET_KEY` (server-only). The browser is redirected straight to
  `authorization_url`; no card data ever touches this app.
- **Two independent paths mark an order paid**, both idempotent via the same
  guard: `lib/data/orders.ts`'s `markOrderPaid`/`markOrderFailed` do
  `UPDATE ... WHERE payment_reference = $1 AND status = 'pending'` — a
  second call (retry, or both paths firing) matches 0 rows and no-ops.
  1. `/checkout/callback` (Server Component) — Squad redirects here after
     payment; it calls Verify Transaction **server-side** (never trusts the
     redirect alone — a customer could hit this URL manually with a
     fabricated reference) and cross-checks the verified amount against the
     order's total before marking paid.
  2. `POST /api/squad/webhook` — the actual source of truth, independent
     of whether the customer's browser ever returns. Reads the **raw**
     request body (`await request.text()`, not pre-parsed JSON) to verify
     the `x-squad-encrypted-body` HMAC-SHA512 header before doing anything
     else; that signature check is the endpoint's *only* auth, rejecting
     with 401 on mismatch. Needs a public URL to receive Squad's calls —
     `localhost` isn't reachable, use `ngrok http 3000` (or similar) and
     register that URL in the Squad dashboard when testing this end.
- **Cart clearing is deferred to success, not submission**:
  `components/ClearCartOnSuccess.tsx` runs only inside the callback page's
  success branch (not before the Squad redirect), so an abandoned or
  declined payment leaves the cart/buy-now state intact for retry. It
  distinguishes "was this Buy Now or the real cart" by checking whether
  `otecng:buyNow` sessionStorage is still present — if so it clears only
  that key; otherwise it clears the persistent cart. Getting this backwards
  would either wipe an unrelated cart on a Buy Now purchase, or leave stale
  items after a real cart checkout.
- **`app/api/checkout/route.ts` wraps its entire body in one `try/catch`.**
  An earlier version only wrapped the Squad call — when the `orders`
  table didn't exist yet (before the migration had been run), the
  `createPendingOrder` throw went unhandled and Next returned its generic
  HTML 500 page instead of JSON, which broke `CheckoutForm`'s `res.json()`
  parse. Caught by an actual browser test hitting submit before assuming it
  worked — don't re-narrow this try/catch without re-testing that failure
  mode.
- Product quantity is picked via a stepper on the product detail page
  (`AddToCartButtons.tsx`), stacked **above** the Add to Cart / Buy Now
  buttons (not beside them — that was an explicit correction), min-clamped
  at 1, resets to 1 after adding.
- `components/CartBadge.tsx` in the header renders nothing until the cart
  has hydrated from `localStorage`, to avoid a flash of "0" on load.

## Things worth knowing before you touch this

- **Image hosts**: `next.config.ts` whitelists the Supabase Storage
  hostname for `next/image`. If you rotate/recreate the Supabase project,
  update that.
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (client-safe); `SUPABASE_SERVICE_ROLE_KEY` (server-only — the import
  script, plus `lib/supabase/serviceClient.ts` for order reads/writes);
  `PAYSTACK_SECRET_KEY` (server-only, `sk_test_...` in dev — checkout +
  webhook, see the Cart/checkout section above). Template at
  `.env.local.example`. Uses Supabase's newer `sb_publishable_...` /
  `sb_secret_...` key format, not the legacy JWT anon/service_role keys.
- **Colors**: brand orange is the shadcn `--primary` token (defined in
  `app/globals.css`), not scattered `orange-600` utility classes — use
  `text-primary` / `bg-primary` etc. for consistency.
- **This is a live scrape of real competitor sites.** Prices/images are
  real third-party data pulled at import time, not licensed assets — worth
  keeping in mind if this goes further toward production/public launch.
- Dev sandbox note (probably irrelevant on your machine): during this
  build, `next/font/google` and Next's image-optimization proxy both threw
  transient timeout errors in the sandboxed container's first cold request
  after a dev-server restart, then worked fine on retry. Not a code bug —
  don't "fix" it by disabling image optimization or self-hosting fonts
  unless you see it persist on a normal connection.

## What's explicitly NOT built yet (known next steps)

- User accounts / auth (deliberately out of scope, not just deferred — see
  the Cart/checkout section above)
- Admin UI for managing products (for now: re-run `npm run seed`, or edit
  directly in the Supabase dashboard). Same goes for orders — no admin view
  of them yet, check the Supabase dashboard table editor.
- Order confirmation emails / SMS — an order lands in Postgres and the
  customer sees an on-screen confirmation, but nothing gets emailed to
  either the customer or the store.
- Stock/inventory tracking — `products` has no quantity-on-hand column;
  checkout doesn't check or decrement anything.
- Delivery fee calculation — checkout total is just the item subtotal, no
  shipping cost logic exists.
- Any TV/washing-machine/AC size-and-brand filtering beyond what
  refrigerators has (user said "only refrigerators" when this came up —
  don't generalize it further without asking)
