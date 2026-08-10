-- otecng orders: guest checkout, no user accounts. All access is
-- server-side via service_role inside Route Handlers — no public RLS
-- policies exist on these tables (unlike brands/categories/products).

create table orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'abandoned')),
  paystack_reference text not null unique,
  total numeric(12, 2) not null,
  currency text not null default 'NGN',
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address text not null,
  delivery_city text not null,
  delivery_state text not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index orders_paystack_reference_idx on orders(paystack_reference);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_price numeric(12, 2) not null,
  qty int not null check (qty > 0)
);

create index order_items_order_id_idx on order_items(order_id);

alter table orders enable row level security;
alter table order_items enable row level security;
-- No policies: only the service_role key (server-side) can read/write.
