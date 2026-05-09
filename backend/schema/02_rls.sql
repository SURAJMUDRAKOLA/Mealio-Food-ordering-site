-- ============================================================
-- MEALIO — Row Level Security Policies
-- Run AFTER 01_tables.sql
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles    enable row level security;
alter table public.addresses   enable row level security;
alter table public.categories  enable row level security;
alter table public.menu_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- ── Profiles ───────────────────────────────────────────────
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ── Addresses ──────────────────────────────────────────────
create policy "Users can manage own addresses"
  on public.addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Categories (public read) ───────────────────────────────
create policy "Anyone can view categories"
  on public.categories for select
  using (true);

-- ── Menu Items (public read) ───────────────────────────────
create policy "Anyone can view menu items"
  on public.menu_items for select
  using (true);

-- ── Orders ─────────────────────────────────────────────────
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on public.orders for update
  using (auth.uid() = user_id);

-- ── Order Items ────────────────────────────────────────────
create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );

create policy "Users can insert order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );
