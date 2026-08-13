-- 在 Supabase SQL Editor 中整段执行
-- 记账应用：categories / records + RLS + 新用户默认分类触发器

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text not null,
  type text not null check (type in ('income', 'expense')),
  unique (user_id, name, type)
);

create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category_id uuid not null references public.categories (id) on delete restrict,
  date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists records_user_date_idx on public.records (user_id, date desc);
create index if not exists records_category_idx on public.records (category_id);

alter table public.categories enable row level security;
alter table public.records enable row level security;

drop policy if exists "categories_select_own" on public.categories;
drop policy if exists "categories_insert_own" on public.categories;
drop policy if exists "categories_update_own" on public.categories;
drop policy if exists "categories_delete_own" on public.categories;
drop policy if exists "records_select_own" on public.records;
drop policy if exists "records_insert_own" on public.records;
drop policy if exists "records_update_own" on public.records;
drop policy if exists "records_delete_own" on public.records;

create policy "categories_select_own"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "categories_update_own"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_delete_own"
  on public.categories for delete
  using (auth.uid() = user_id);

create policy "records_select_own"
  on public.records for select
  using (auth.uid() = user_id);

create policy "records_insert_own"
  on public.records for insert
  with check (auth.uid() = user_id);

create policy "records_update_own"
  on public.records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "records_delete_own"
  on public.records for delete
  using (auth.uid() = user_id);

create or replace function public.handle_new_user_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, icon, type) values
    (new.id, '餐饮', '🍔', 'expense'),
    (new.id, '交通', '🚗', 'expense'),
    (new.id, '购物', '🛍', 'expense'),
    (new.id, '娱乐', '🎬', 'expense'),
    (new.id, '居家', '💡', 'expense'),
    (new.id, '学习', '📚', 'expense'),
    (new.id, '医疗', '❤️', 'expense'),
    (new.id, '其他', '🧧', 'expense'),
    (new.id, '工资', '💼', 'income'),
    (new.id, '理财', '💰', 'income'),
    (new.id, '礼金', '🎁', 'income'),
    (new.id, '其他', '🧧', 'income');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_categories on auth.users;
create trigger on_auth_user_created_categories
  after insert on auth.users
  for each row execute function public.handle_new_user_categories();

create table if not exists public.reminder_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  enabled boolean not null default false,
  remind_time time not null default '21:00',
  template_key text not null default 'casual',
  message_body text not null default '今天还没记账，有事没事记一笔',
  last_sent_on date,
  updated_at timestamptz not null default now()
);

create table if not exists public.reminder_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists reminder_subs_user_idx
  on public.reminder_subscriptions (user_id);

alter table public.reminder_settings enable row level security;
alter table public.reminder_subscriptions enable row level security;

drop policy if exists "reminder_settings_select_own" on public.reminder_settings;
drop policy if exists "reminder_settings_upsert_own" on public.reminder_settings;
drop policy if exists "reminder_settings_update_own" on public.reminder_settings;
drop policy if exists "reminder_subs_select_own" on public.reminder_subscriptions;
drop policy if exists "reminder_subs_insert_own" on public.reminder_subscriptions;
drop policy if exists "reminder_subs_update_own" on public.reminder_subscriptions;
drop policy if exists "reminder_subs_delete_own" on public.reminder_subscriptions;

create policy "reminder_settings_select_own"
  on public.reminder_settings for select
  using (auth.uid() = user_id);

create policy "reminder_settings_upsert_own"
  on public.reminder_settings for insert
  with check (auth.uid() = user_id);

create policy "reminder_settings_update_own"
  on public.reminder_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reminder_subs_select_own"
  on public.reminder_subscriptions for select
  using (auth.uid() = user_id);

create policy "reminder_subs_insert_own"
  on public.reminder_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "reminder_subs_delete_own"
  on public.reminder_subscriptions for delete
  using (auth.uid() = user_id);

create policy "reminder_subs_update_own"
  on public.reminder_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
