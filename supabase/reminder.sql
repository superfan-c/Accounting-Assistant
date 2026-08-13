-- 记账提醒（Web Push）：在 SQL Editor 中执行
-- 已有库只需跑本文件；新库也可只跑 schema.sql（已包含同等内容）

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
