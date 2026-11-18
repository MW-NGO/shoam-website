-- =========================================================
--  SHOAM — Supabase schema
--  Run this once in Supabase:  SQL Editor -> New query -> paste -> Run
--  It is safe to run more than once.
-- =========================================================

begin;

-- ---------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  status      text not null default 'Ongoing',
  category    text not null default '',
  summary     text not null default '',
  description text not null default '',
  lead        text not null default '',
  location    text not null default 'Malawi',
  timeline    text not null default '',
  highlights  text[] not null default '{}',
  photos      text[] not null default '{}',
  featured    boolean not null default false,
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null default '',
  team_group  text not null default 'executive',   -- leadership | executive | volunteer | honorary
  studies     text not null default '',
  based       text not null default 'Malawi',
  focus       text not null default '',
  bio         text not null default '',
  quote       text not null default '',
  email       text not null default '',
  photo       text not null default '',
  featured    boolean not null default false,
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  standfirst  text not null default '',
  category    text not null default 'Story',
  author      text not null default 'SHOAM Communications',
  date        date not null default current_date,
  layout      text not null default 'feature',      -- feature | interview | photo-essay | field-note
  cover       text not null default '',
  tags        text[] not null default '{}',
  body        text not null default '',
  featured    boolean not null default false,
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists projects_published_idx on public.projects (published, sort_order);
create index if not exists members_published_idx  on public.members  (published, sort_order);
create index if not exists articles_published_idx on public.articles (published, date desc);

-- ---------------------------------------------------------
-- 2. Keep updated_at honest
-- ---------------------------------------------------------
create or replace function public.shoam_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shoam_projects_touch on public.projects;
create trigger shoam_projects_touch before update on public.projects
  for each row execute function public.shoam_touch_updated_at();

drop trigger if exists shoam_members_touch on public.members;
create trigger shoam_members_touch before update on public.members
  for each row execute function public.shoam_touch_updated_at();

drop trigger if exists shoam_articles_touch on public.articles;
create trigger shoam_articles_touch before update on public.articles
  for each row execute function public.shoam_touch_updated_at();

-- ---------------------------------------------------------
-- 3. Row level security
--    Public (anon) can read only published rows.
--    Signed-in editors can read and write everything.
-- ---------------------------------------------------------
alter table public.projects enable row level security;
alter table public.members  enable row level security;
alter table public.articles enable row level security;

drop policy if exists "projects public read" on public.projects;
create policy "projects public read" on public.projects
  for select to anon, authenticated using (published = true);

drop policy if exists "projects editor read" on public.projects;
create policy "projects editor read" on public.projects
  for select to authenticated using (true);

drop policy if exists "projects editor write" on public.projects;
create policy "projects editor write" on public.projects
  for all to authenticated using (true) with check (true);

drop policy if exists "members public read" on public.members;
create policy "members public read" on public.members
  for select to anon, authenticated using (published = true);

drop policy if exists "members editor read" on public.members;
create policy "members editor read" on public.members
  for select to authenticated using (true);

drop policy if exists "members editor write" on public.members;
create policy "members editor write" on public.members
  for all to authenticated using (true) with check (true);

drop policy if exists "articles public read" on public.articles;
create policy "articles public read" on public.articles
  for select to anon, authenticated using (published = true);

drop policy if exists "articles editor read" on public.articles;
create policy "articles editor read" on public.articles
  for select to authenticated using (true);

drop policy if exists "articles editor write" on public.articles;
create policy "articles editor write" on public.articles
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------
-- 4. Table grants
--    RLS policies define which rows are visible; these grants
--    also allow the anon/authenticated roles to reach the tables
--    through Supabase's REST API.
-- ---------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.projects, public.members, public.articles to anon, authenticated;
grant insert, update, delete on public.projects, public.members, public.articles to authenticated;

-- ---------------------------------------------------------
-- 5. Photo storage
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists "media editor write" on storage.objects;
create policy "media editor write" on storage.objects
  for all to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

commit;
