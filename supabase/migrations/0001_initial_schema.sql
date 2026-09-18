-- Draft schema for the future Supabase migration described in
-- docs/SUPABASE_MIGRATION.md. Not required to run VYNKÆR Training V1 —
-- the app is local-first via AsyncStorage until this is adopted.

create extension if not exists "pgcrypto";

create table if not exists athletes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  display_name text not null,
  profile jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references athletes on delete cascade not null,
  workout_number int not null,
  date timestamptz not null,
  session jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists training_state (
  athlete_id uuid primary key references athletes on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists workout_sessions_athlete_date_idx
  on workout_sessions (athlete_id, date desc);

alter table athletes enable row level security;
alter table workout_sessions enable row level security;
alter table training_state enable row level security;

create policy "Athletes manage their own row" on athletes
  for all using (user_id = auth.uid());

create policy "Athletes manage their own sessions" on workout_sessions
  for all using (athlete_id in (select id from athletes where user_id = auth.uid()));

create policy "Athletes manage their own training state" on training_state
  for all using (athlete_id in (select id from athletes where user_id = auth.uid()));
