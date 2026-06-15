create extension if not exists "pgcrypto";

alter table public.profiles
  alter column avatar_url set default '/assets/avatars/avatar_01_barong_boy.png',
  alter column rank_title set default 'Aspirant';

update public.profiles
set
  avatar_url = case
    when avatar_url is null or avatar_url = '' or avatar_url = 'character_1'
      then '/assets/avatars/avatar_01_barong_boy.png'
    else avatar_url
  end,
  rank_title = case
    when rank_title is null or rank_title = '' or rank_title = 'Cyber Rookie'
      then 'Aspirant'
    else rank_title
  end
where avatar_url is null
  or avatar_url = ''
  or avatar_url = 'character_1'
  or rank_title is null
  or rank_title = ''
  or rank_title = 'Cyber Rookie';

create table if not exists public.scam_tips (
  id uuid primary key default gen_random_uuid(),
  tip_text text not null,
  created_at timestamptz not null default now()
);

delete from public.scam_tips
where id in (
  select id
  from (
    select id, row_number() over (partition by tip_text order by created_at, id) as row_number
    from public.scam_tips
  ) duplicates
  where row_number > 1
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'scam_tips_tip_text_key'
      and conrelid = 'public.scam_tips'::regclass
  ) then
    alter table public.scam_tips
      add constraint scam_tips_tip_text_key unique (tip_text);
  end if;
end;
$$;

alter table public.scam_tips enable row level security;

drop policy if exists "Scam tips are public read-only" on public.scam_tips;
create policy "Scam tips are public read-only"
on public.scam_tips for select
using (true);

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

update public.modules
set title = case title
  when 'Phishing Basics' then 'The Prophecy of the Phishing Serpent'
  when 'Fake Shopping' then 'The Merchant Mirage'
  when 'Investment Scams' then 'The Golden Hoard Trap'
  when 'Social Engineering' then 'The Whispering Court'
  when 'OTP Scams' then 'The Sacred Token Trial'
  when 'AI Scams' then 'The Mirror Spirit Illusion'
  else title
end
where title in ('Phishing Basics', 'Fake Shopping', 'Investment Scams', 'Social Engineering', 'OTP Scams', 'AI Scams');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url, avatar_key, level, xp, total_xp, day_streak, week_streak, rank_title)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    '/assets/avatars/avatar_01_barong_boy.png',
    'character_1',
    1,
    0,
    0,
    0,
    0,
    'Aspirant'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
