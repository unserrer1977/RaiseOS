-- Founder profiles, assessments, and a private deck bucket.
-- Authorization uses auth.uid() only. Do not trust user_metadata.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('intake', 'followup', 'complete')),
  intake jsonb not null default '{}'::jsonb,
  field_sources jsonb not null default '{}'::jsonb,
  follow_ups jsonb not null default '[]'::jsonb,
  report jsonb,
  share_token text not null unique,
  deck_path text,
  deck_name text,
  deck_text text,
  extraction_mode text not null default 'rules' check (extraction_mode in ('rules', 'model')),
  extraction_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assessments_user_updated_idx
  on public.assessments (user_id, updated_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger assessments_set_updated_at
  before update on public.assessments
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.assessments enable row level security;

revoke all on table public.profiles from anon, authenticated, public;
revoke all on table public.assessments from anon, authenticated, public;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.assessments to authenticated;

create policy profiles_select on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy profiles_update on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy assessments_select on public.assessments
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy assessments_insert on public.assessments
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy assessments_update on public.assessments
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy assessments_delete on public.assessments
  for delete to authenticated
  using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('decks', 'decks', false)
on conflict (id) do nothing;

create policy decks_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'decks'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy decks_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'decks'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy decks_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'decks'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'decks'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy decks_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'decks'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
