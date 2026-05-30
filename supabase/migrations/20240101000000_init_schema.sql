-- Initial schema for Try On Lemonteen

create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  hex         text not null,
  opacity     numeric(3,2) not null default 0.75,
  finish      text not null check (finish in ('glossy','matte','satin')),
  collection  text not null,
  price       integer not null,
  image_url   text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists sessions (
  id                  uuid primary key default gen_random_uuid(),
  device_type         text,
  browser             text,
  skin_tone_estimate  text,
  created_at          timestamptz not null default now()
);

create table if not exists try_on_events (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references sessions(id) on delete set null,
  product_id  uuid references products(id) on delete set null,
  event_type  text not null check (event_type in ('shade_selected','photo_captured','add_to_cart','share')),
  created_at  timestamptz not null default now()
);

-- RLS enabled on all user-data tables
alter table sessions      enable row level security;
alter table try_on_events enable row level security;
