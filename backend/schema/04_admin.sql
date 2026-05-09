-- ============================================================
-- MEALIO — Admin Role Schema
-- Run AFTER 01_tables.sql, 02_rls.sql, 03_functions.sql
-- ============================================================

-- Add role column to profiles (default 'user', admins have 'admin')
alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

-- ── Admin RLS helper ───────────────────────────────────────
-- Reusable function: returns true if the current user is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer   -- runs with elevated privileges so it can read profiles
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── Menu Items: admin write access ─────────────────────────
create policy "Admins can insert menu items"
  on public.menu_items for insert
  with check (public.is_admin());

create policy "Admins can update menu items"
  on public.menu_items for update
  using (public.is_admin());

create policy "Admins can delete menu items"
  on public.menu_items for delete
  using (public.is_admin());

-- ── Categories: admin write access ─────────────────────────
create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Orders: admins can view and update all orders ──────────
create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

create policy "Admins can update all orders"
  on public.orders for update
  using (public.is_admin());

-- ── Order Items: admins can view all ───────────────────────
create policy "Admins can view all order items"
  on public.order_items for select
  using (public.is_admin());

-- ── Profiles: admins can view all profiles ─────────────────
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- To make yourself an admin (run in Supabase SQL Editor):
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
