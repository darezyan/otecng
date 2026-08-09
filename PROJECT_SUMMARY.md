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

The site is a catalog/browsing experience only: product listing, filters,
search, product detail pages with image galleries. **No cart, checkout,
payments, or user accounts** — that was deliberately scoped out and would be
the natural next phase.

## Tech stack

- **Next.js 16** (App Router, Turbopack, Server Components do the data
  fetching directly)
- **TypeScript**, strict
- **Tailwind CSS v4**
- **shadcn/ui** — note: this project's shadcn setup uses **Base UI**
  under the hood, not Radix. Components take a `render={<Link .../>}` prop
  for polymorphism, not `asChild`. Check `components/ui/*.tsx` before
  assuming Radix conventions.
- **Supabase**: Postgres for data, Storage for images, RLS locked to
  public-read-only (writes only via the service-role key, used only by the
  import script, never shipped to the client)
- Fonts: **Inter** (body) + **Plus Jakarta Sans** (headings, `font-heading`
  utility), both via `next/font/google`

## Database schema

Four tables, see `supabase/migrations/0001_init.sql`:
- `brands` (id, name, slug, logo_url)
- `categories` (id, name, slug) — created on demand by the import script,
  not hardcoded
- `products` (id, brand_id, category_id, name, slug, price, currency,
  description, source_url, created_at) — `source_url` is the original
  Fouani/Jumia URL, used for idempotent re-imports and provenance, not shown
  to shoppers
- `product_images` (id, product_id, url, position, is_primary)

RLS: anon key can `SELECT` on all four tables, cannot write. Verified.

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

## Things worth knowing before you touch this

- **Image hosts**: `next.config.ts` whitelists the Supabase Storage
  hostname for `next/image`. If you rotate/recreate the Supabase project,
  update that.
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (client-safe), `SUPABASE_SERVICE_ROLE_KEY` (import script only, never
  imported by app code). Template at `.env.local.example`. Uses Supabase's
  newer `sb_publishable_...` / `sb_secret_...` key format, not the legacy
  JWT anon/service_role keys.
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

- Cart / checkout / payments
- User accounts / auth
- Admin UI for managing products (for now: re-run `npm run seed`, or edit
  directly in the Supabase dashboard)
- Any TV/washing-machine/AC size-and-brand filtering beyond what
  refrigerators has (user said "only refrigerators" when this came up —
  don't generalize it further without asking)
