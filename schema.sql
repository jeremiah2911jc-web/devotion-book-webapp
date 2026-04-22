-- Supabase SQL setup for devotion-book-webapp-full
-- fixed version with grants for authenticated users

create extension if not exists pgcrypto;

create table if not exists public.devotion_notes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  scripture_reference text,
  category text,
  tags jsonb not null default '[]'::jsonb,
  summary text,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_projects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subtitle text,
  author_name text,
  description text,
  template_code text not null default 'devotion',
  language text not null default 'mul',
  cover_data_url text,
  preface text,
  afterword text,
  toc_enabled boolean not null default true,
  chapters jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_snapshots (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  book_project_id text not null references public.book_projects(id) on delete cascade,
  snapshot_json jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.devotion_notes enable row level security;
alter table public.book_projects enable row level security;
alter table public.book_snapshots enable row level security;

drop policy if exists "notes_select_own" on public.devotion_notes;
create policy "notes_select_own"
on public.devotion_notes
for select
using (auth.uid() = user_id);

drop policy if exists "notes_insert_own" on public.devotion_notes;
create policy "notes_insert_own"
on public.devotion_notes
for insert
with check (auth.uid() = user_id);

drop policy if exists "notes_update_own" on public.devotion_notes;
create policy "notes_update_own"
on public.devotion_notes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notes_delete_own" on public.devotion_notes;
create policy "notes_delete_own"
on public.devotion_notes
for delete
using (auth.uid() = user_id);

drop policy if exists "books_select_own" on public.book_projects;
create policy "books_select_own"
on public.book_projects
for select
using (auth.uid() = user_id);

drop policy if exists "books_insert_own" on public.book_projects;
create policy "books_insert_own"
on public.book_projects
for insert
with check (auth.uid() = user_id);

drop policy if exists "books_update_own" on public.book_projects;
create policy "books_update_own"
on public.book_projects
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "books_delete_own" on public.book_projects;
create policy "books_delete_own"
on public.book_projects
for delete
using (auth.uid() = user_id);

drop policy if exists "snapshots_select_own" on public.book_snapshots;
create policy "snapshots_select_own"
on public.book_snapshots
for select
using (auth.uid() = user_id);

drop policy if exists "snapshots_insert_own" on public.book_snapshots;
create policy "snapshots_insert_own"
on public.book_snapshots
for insert
with check (auth.uid() = user_id);

drop policy if exists "snapshots_delete_own" on public.book_snapshots;
create policy "snapshots_delete_own"
on public.book_snapshots
for delete
using (auth.uid() = user_id);

create index if not exists devotion_notes_user_updated_idx
on public.devotion_notes(user_id, updated_at desc);

create index if not exists book_projects_user_updated_idx
on public.book_projects(user_id, updated_at desc);

create index if not exists book_snapshots_user_created_idx
on public.book_snapshots(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists devotion_notes_set_updated_at on public.devotion_notes;
create trigger devotion_notes_set_updated_at
before update on public.devotion_notes
for each row
execute function public.set_updated_at();

drop trigger if exists book_projects_set_updated_at on public.book_projects;
create trigger book_projects_set_updated_at
before update on public.book_projects
for each row
execute function public.set_updated_at();

-- important: grant actual table permissions to authenticated users
grant usage on schema public to authenticated;

grant select, insert, update, delete
on table public.devotion_notes
to authenticated;

grant select, insert, update, delete
on table public.book_projects
to authenticated;

grant select, insert, update, delete
on table public.book_snapshots
to authenticated;

grant execute
on function public.set_updated_at()
to authenticated;

-- optional: also allow anon to use schema only
-- no table permissions granted to anon by default
grant usage on schema public to anon;

do $$
begin
  alter publication supabase_realtime add table public.devotion_notes;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.book_projects;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.book_snapshots;
exception
  when duplicate_object then null;
end $$;
