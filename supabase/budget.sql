-- 预算管理：在 SQL Editor 中执行
-- 已有库只需跑本文件；新库也可只跑 schema.sql（已包含同等内容）

create table if not exists public.budget_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  enabled boolean not null default false,
  month_amount integer not null default 0 check (month_amount >= 0),
  popup_half_month text,
  popup_yellow_month text,
  popup_red_month text,
  updated_at timestamptz not null default now()
);

alter table public.budget_settings drop column if exists push_yellow_month;
alter table public.budget_settings drop column if exists push_red_month;
alter table public.budget_settings add column if not exists popup_half_month text;

create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  amount integer not null check (amount > 0),
  popup_half_month text,
  popup_yellow_month text,
  popup_red_month text,
  unique (user_id, category_id)
);

alter table public.budget_categories add column if not exists popup_half_month text;

create index if not exists budget_categories_user_idx
  on public.budget_categories (user_id);

alter table public.budget_settings enable row level security;
alter table public.budget_categories enable row level security;

drop policy if exists "budget_settings_select_own" on public.budget_settings;
drop policy if exists "budget_settings_insert_own" on public.budget_settings;
drop policy if exists "budget_settings_update_own" on public.budget_settings;
drop policy if exists "budget_categories_select_own" on public.budget_categories;
drop policy if exists "budget_categories_insert_own" on public.budget_categories;
drop policy if exists "budget_categories_update_own" on public.budget_categories;
drop policy if exists "budget_categories_delete_own" on public.budget_categories;

create policy "budget_settings_select_own"
  on public.budget_settings for select
  using (auth.uid() = user_id);

create policy "budget_settings_insert_own"
  on public.budget_settings for insert
  with check (auth.uid() = user_id);

create policy "budget_settings_update_own"
  on public.budget_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "budget_categories_select_own"
  on public.budget_categories for select
  using (auth.uid() = user_id);

create policy "budget_categories_insert_own"
  on public.budget_categories for insert
  with check (auth.uid() = user_id);

create policy "budget_categories_update_own"
  on public.budget_categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "budget_categories_delete_own"
  on public.budget_categories for delete
  using (auth.uid() = user_id);
