-- Run once in the Supabase SQL Editor of the Polski project.
-- Arabski w domu keeps its own table, so the Polish app's `progress` table is not touched.
-- One row per account; each person can only read and change their own row.
create table if not exists public.arabski_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.arabski_progress enable row level security;

grant select, insert, update on public.arabski_progress to authenticated;

create policy "read own arabski progress" on public.arabski_progress
  for select to authenticated using (auth.uid() = user_id);

create policy "add own arabski progress" on public.arabski_progress
  for insert to authenticated with check (auth.uid() = user_id);

create policy "change own arabski progress" on public.arabski_progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Read-only progress for the husband's follow link. The account id in the link is the key,
-- so the page needs no sign-in, and nobody can list accounts or change anything through it.
create or replace function public.arabski_view(uid uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select data from public.arabski_progress where user_id = uid;
$$;

revoke all on function public.arabski_view(uuid) from public;
grant execute on function public.arabski_view(uuid) to anon, authenticated;
