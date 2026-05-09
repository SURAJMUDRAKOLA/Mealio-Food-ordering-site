-- ============================================================
-- MEALIO — Table Definitions
-- Run this first in Supabase SQL Editor
-- ============================================================

-- ── Profiles (extends auth.users) ──────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  email       text not null,
  phone       text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ── Addresses ──────────────────────────────────────────────
create table if not exists public.addresses (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  label       text not null default 'Home',
  line1       text not null,
  line2       text,
  city        text not null,
  pincode     text not null,
  is_default  boolean default false,
  created_at  timestamptz default now() not null
);

-- ── Categories ─────────────────────────────────────────────
create table if not exists public.categories (
  id          text primary key,
  name        text not null,
  image_url   text not null,
  sort_order  int default 0
);

-- ── Menu Items ─────────────────────────────────────────────
create table if not exists public.menu_items (
  id           text primary key,
  name         text not null,
  description  text,
  price        numeric(8,2) not null,
  image_url    text not null,
  category_id  text references public.categories(id),
  is_veg       boolean default true,
  is_popular   boolean default false,
  rating       numeric(3,1),
  prep_time    text,
  tag          text,
  is_available boolean default true not null,
  created_at   timestamptz default now() not null
);

-- ── Orders ─────────────────────────────────────────────────
create table if not exists public.orders (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references public.profiles(id) not null,
  status           text not null default 'placed',
  address_snapshot jsonb,
  subtotal         numeric(8,2) not null,
  delivery_fee     numeric(8,2) not null default 0,
  taxes            numeric(8,2) not null default 0,
  grand_total      numeric(8,2) not null,
  payment_method   text default 'card',
  payment_status   text default 'paid',
  placed_at        timestamptz default now() not null,
  updated_at       timestamptz default now() not null,
  constraint valid_status check (
    status in ('placed','confirmed','preparing','out_for_delivery','delivered','cancelled')
  )
);

-- ── Order Items ────────────────────────────────────────────
create table if not exists public.order_items (
  id         uuid default gen_random_uuid() primary key,
  order_id   uuid references public.orders(id) on delete cascade not null,
  item_id    text,
  name       text not null,
  price      numeric(8,2) not null,
  image_url  text,
  quantity   int not null check (quantity > 0),
  is_veg     boolean
);
