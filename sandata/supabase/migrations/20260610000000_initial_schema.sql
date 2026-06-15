create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text default '/assets/avatars/avatar_01_barong_boy.png',
  avatar_key text not null default 'character_1',
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  day_streak integer not null default 0 check (day_streak >= 0),
  total_xp integer not null default 0 check (total_xp >= 0),
  week_streak integer not null default 0 check (week_streak >= 0),
  rank_title text not null default 'Aspirant',
  quizzes_completed integer not null default 0 check (quizzes_completed >= 0),
  accuracy integer not null default 0 check (accuracy between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  icon_path text not null,
  total_lessons integer not null default 1 check (total_lessons >= 1),
  xp_reward integer not null default 50 check (xp_reward >= 0),
  difficulty text not null check (difficulty in ('beginner', 'popular', 'advanced')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  completed_lessons integer not null default 0 check (completed_lessons >= 0),
  is_completed boolean not null default false,
  last_accessed timestamptz not null default now(),
  primary key (user_id, module_id)
);

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  target_count integer not null check (target_count >= 1),
  xp_reward integer not null default 0 check (xp_reward >= 0),
  icon_key text not null default 'lightning',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_missions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  current_count integer not null default 0 check (current_count >= 0),
  is_claimed boolean not null default false,
  mission_date date not null default current_date,
  primary key (user_id, mission_id, mission_date)
);

create table if not exists public.scam_tips (
  id uuid primary key default gen_random_uuid(),
  tip_text text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url, avatar_key)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    '/assets/avatars/avatar_01_barong_boy.png',
    'character_1'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.user_progress enable row level security;
alter table public.missions enable row level security;
alter table public.user_missions enable row level security;
alter table public.scam_tips enable row level security;

drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles are readable by everyone"
on public.profiles for select
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Modules are public read-only" on public.modules;
create policy "Modules are public read-only"
on public.modules for select
using (true);

drop policy if exists "Missions are public read-only" on public.missions;
create policy "Missions are public read-only"
on public.missions for select
using (active = true);

drop policy if exists "Scam tips are public read-only" on public.scam_tips;
create policy "Scam tips are public read-only"
on public.scam_tips for select
using (true);

drop policy if exists "Users can read their own progress" on public.user_progress;
create policy "Users can read their own progress"
on public.user_progress for select
using (auth.uid() = user_id);

drop policy if exists "Users can write their own progress" on public.user_progress;
create policy "Users can write their own progress"
on public.user_progress for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own missions" on public.user_missions;
create policy "Users can read their own missions"
on public.user_missions for select
using (auth.uid() = user_id);

drop policy if exists "Users can write their own missions" on public.user_missions;
create policy "Users can write their own missions"
on public.user_missions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into public.modules (title, category, icon_path, total_lessons, xp_reward, difficulty, sort_order)
values
  ('The Prophecy of the Phishing Serpent', 'phishing', 'phishing', 5, 80, 'beginner', 10),
  ('The Merchant Mirage', 'fake_shopping', 'fake_shopping', 4, 80, 'beginner', 20),
  ('The Golden Hoard Trap', 'investment_scams', 'investment_scams', 4, 100, 'popular', 30),
  ('The Whispering Court', 'social_engineering', 'social_engineering', 5, 100, 'popular', 40),
  ('The Sacred Token Trial', 'otp_scams', 'otp', 3, 70, 'beginner', 50),
  ('The Mirror Spirit Illusion', 'ai_scams', 'ai_scams', 3, 120, 'advanced', 60)
on conflict do nothing;

insert into public.missions (description, target_count, xp_reward, icon_key, sort_order)
values
  ('Identify 3 phishing messages', 3, 80, 'lightning', 10),
  ('Complete 1 lesson in any module', 1, 50, 'shield', 20),
  ('Get 5 correct answers in quizzes', 5, 60, 'gift', 30)
on conflict do nothing;

insert into public.scam_tips (tip_text)
values
  ('Beware the whispers of false prophets who promise riches; they often lead to empty coffers.'),
  ('Just as a warrior inspects their armor, always check the sender before trusting a message.'),
  ('Do not share your sacred tokens, passwords, or OTPs with strangers, even if they sound urgent.'),
  ('When a request feels urgent, step onto a separate path and verify through the official app or hotline.'),
  ('Offers of effortless treasure are often bait; verify prizes, investments, and discounts before acting.'),
  ('A strange link is like a sealed scroll from an unknown court; inspect it before opening.'),
  ('Enter accounts through trusted gates you type yourself, not through buttons in surprise messages.')
on conflict do nothing;

do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
