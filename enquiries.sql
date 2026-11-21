-- Run once in Supabase > SQL Editor. Adds ONE new table. Existing tables and data are untouched.
create table if not exists public.enquiries(
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 kind text not null check (kind in ('general','demo','accountant','bulk','government','partner')),
 name text not null check (char_length(name) between 1 and 120),
 email text not null check (char_length(email) between 5 and 200),
 phone text check (phone is null or char_length(phone)<=40),
 organisation text check (organisation is null or char_length(organisation)<=200),
 businesses int check (businesses is null or businesses between 1 and 1000000),
 message text check (message is null or char_length(message)<=3000),
 status text not null default 'new'
);
alter table public.enquiries enable row level security;
drop policy if exists "anyone can send an enquiry" on public.enquiries;
create policy "anyone can send an enquiry" on public.enquiries for insert to anon, authenticated with check (status='new');
-- No select policy on purpose: visitors cannot read enquiries. You read them in Supabase > Table Editor.
