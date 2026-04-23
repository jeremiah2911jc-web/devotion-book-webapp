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

-- Cloud bookshelf: fixed exported EPUB versions and synced reading progress.
create table if not exists public.library_books (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text,
  description text,
  cover_image_path text,
  epub_file_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_read_at timestamptz,
  reading_progress numeric not null default 0 check (reading_progress >= 0 and reading_progress <= 1),
  total_chapters integer not null default 0,
  current_chapter integer not null default 0,
  source_project_id text,
  source_compilation_id text,
  version text not null default '1.0.0',
  is_archived boolean not null default false
);

create unique index if not exists library_books_id_user_uidx
on public.library_books (id, user_id);

create table if not exists public.library_book_chapters (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null,
  title text not null,
  chapter_order integer not null default 0,
  href text not null,
  chapter_path text not null,
  progress numeric not null default 0 check (progress >= 0 and progress <= 1),
  constraint library_book_chapters_book_user_fk
    foreign key (book_id, user_id)
    references public.library_books (id, user_id)
    on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- Migration guard for environments that already created the old single-column FK.
alter table public.library_book_chapters
  drop constraint if exists library_book_chapters_book_id_fkey;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'library_book_chapters_book_user_fk'
      and conrelid = 'public.library_book_chapters'::regclass
  ) then
    alter table public.library_book_chapters
      add constraint library_book_chapters_book_user_fk
      foreign key (book_id, user_id)
      references public.library_books (id, user_id)
      on delete cascade;
  end if;
end $$;
-- library_book_chapters_book_user_fk_migration
alter table public.library_books enable row level security;
alter table public.library_book_chapters enable row level security;

drop policy if exists "library_books_select_own" on public.library_books;
create policy "library_books_select_own" on public.library_books for select using (auth.uid() = user_id);
drop policy if exists "library_books_insert_own" on public.library_books;
create policy "library_books_insert_own" on public.library_books for insert with check (auth.uid() = user_id);
drop policy if exists "library_books_update_own" on public.library_books;
create policy "library_books_update_own" on public.library_books for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "library_books_delete_own" on public.library_books;
create policy "library_books_delete_own" on public.library_books for delete using (auth.uid() = user_id);

drop policy if exists "library_chapters_select_own" on public.library_book_chapters;
create policy "library_chapters_select_own" on public.library_book_chapters for select using (auth.uid() = user_id);
drop policy if exists "library_chapters_insert_own" on public.library_book_chapters;
create policy "library_chapters_insert_own" on public.library_book_chapters for insert with check (auth.uid() = user_id);
drop policy if exists "library_chapters_update_own" on public.library_book_chapters;
create policy "library_chapters_update_own" on public.library_book_chapters for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "library_chapters_delete_own" on public.library_book_chapters;
create policy "library_chapters_delete_own" on public.library_book_chapters for delete using (auth.uid() = user_id);
create index if not exists library_books_user_last_read_idx on public.library_books(user_id, last_read_at desc nulls last, created_at desc);
create index if not exists library_books_user_source_idx on public.library_books(user_id, source_project_id, created_at desc);
create index if not exists library_chapters_book_order_idx on public.library_book_chapters(book_id, chapter_order);

drop trigger if exists library_books_set_updated_at on public.library_books;
create trigger library_books_set_updated_at before update on public.library_books for each row execute function public.set_updated_at();
drop trigger if exists library_chapters_set_updated_at on public.library_book_chapters;
create trigger library_chapters_set_updated_at before update on public.library_book_chapters for each row execute function public.set_updated_at();

grant select, insert, update, delete on table public.library_books to authenticated;
grant select, insert, update, delete on table public.library_book_chapters to authenticated;

-- Private Supabase Storage bucket for EPUB and cover files.
-- The app stores only storage object paths; it downloads private EPUBs with the authenticated client
-- and creates short-lived signed URLs for covers at read time.
insert into storage.buckets (id, name, public)
values ('library-books', 'library-books', false)
on conflict (id) do update set public = false;

drop policy if exists "library_books_storage_select_own" on storage.objects;
create policy "library_books_storage_select_own" on storage.objects for select to authenticated using (
  bucket_id = 'library-books' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text and (storage.foldername(name))[3] = 'books'
);
drop policy if exists "library_books_storage_insert_own" on storage.objects;
create policy "library_books_storage_insert_own" on storage.objects for insert to authenticated with check (
  bucket_id = 'library-books' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text and (storage.foldername(name))[3] = 'books'
);
drop policy if exists "library_books_storage_update_own" on storage.objects;
create policy "library_books_storage_update_own" on storage.objects for update to authenticated using (
  bucket_id = 'library-books' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text and (storage.foldername(name))[3] = 'books'
) with check (
  bucket_id = 'library-books' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text and (storage.foldername(name))[3] = 'books'
);
drop policy if exists "library_books_storage_delete_own" on storage.objects;
create policy "library_books_storage_delete_own" on storage.objects for delete to authenticated using (
  bucket_id = 'library-books' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text and (storage.foldername(name))[3] = 'books'
);