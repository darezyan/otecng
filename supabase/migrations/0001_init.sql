-- otecng catalog schema: brands, categories, products, product_images
-- Public read-only via RLS; writes only via service_role (import script).

create extension if not exists "pgcrypto";

create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete restrict,
  category_id uuid not null references categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  price numeric(12, 2) not null,
  currency text not null default 'NGN',
  description text,
  source_url text,
  created_at timestamptz not null default now()
);

create index products_brand_id_idx on products(brand_id);
create index products_category_id_idx on products(category_id);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  is_primary boolean not null default false
);

create index product_images_product_id_idx on product_images(product_id);

alter table brands enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;

create policy "Public read brands" on brands for select using (true);
create policy "Public read categories" on categories for select using (true);
create policy "Public read products" on products for select using (true);
create policy "Public read product_images" on product_images for select using (true);

-- Categories are created on demand by the import script as it encounters
-- them; only brands are fixed and seeded here.
insert into brands (name, slug) values
  ('Hisense', 'hisense'),
  ('LG', 'lg'),
  ('Maxi', 'maxi'),
  ('Thermocool', 'thermocool'),
  ('Snowsea', 'snowsea');
