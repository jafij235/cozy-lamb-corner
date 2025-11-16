-- Security hardening: profanity enforcement and strict RLS for prayer_requests

-- Ensure unaccent is available for robust normalization
create extension if not exists unaccent;

-- Normalize text similar to client-side logic
create or replace function public.normalize_text(_t text)
returns text
language sql
stable
as $$
  select regexp_replace(
    translate(lower(unaccent(coalesce(_t,''))),
      '0134578@$',
      'oieastbaas'
    ),
    '[^a-z0-9]+', '', 'g'
  );
$$;

-- Profanity detection function
create or replace function public.contains_profanity(_t text)
returns boolean
language plpgsql
stable
as $$
declare
  norm text := public.normalize_text(_t);
  bad_words text[] := array[
    'merda','bosta','porra','caralho','puta','putaria','foda','foder','fodase','cu','buceta','penis','piroca','tesao','cacete','vagina','cuzao','fdp','pqp','inferno','diabo','satanas','droga','maconha','cocaina','crack','heroina','aborto','idiota','cagar','bunda','sexo','pinto','pau','saco','bolas','rola','baleia'
  ];
  w text;
begin
  if norm is null or length(norm)=0 then
    return false;
  end if;
  foreach w in array bad_words loop
    if position(public.normalize_text(w) in norm) > 0 then
      return true;
    end if;
  end loop;
  return false;
end;
$$;

-- Trigger function to block profanity on INSERT/UPDATE
create or replace function public.trg_prayer_requests_profanity()
returns trigger
language plpgsql
as $$
begin
  if public.contains_profanity(new.content) then
    raise exception 'Conteúdo contém linguagem inadequada';
  end if;
  return new;
end;
$$;

-- Attach trigger to prayer_requests
drop trigger if exists trg_prayer_requests_profanity on public.prayer_requests;
create trigger trg_prayer_requests_profanity
before insert or update on public.prayer_requests
for each row execute function public.trg_prayer_requests_profanity();

-- Drop existing policies to recreate with correct syntax
drop policy if exists "pr_select_all_auth" on public.prayer_requests;
drop policy if exists "pr_insert_own" on public.prayer_requests;
drop policy if exists "pr_update_own_or_admin" on public.prayer_requests;
drop policy if exists "pr_delete_own_or_admin" on public.prayer_requests;
drop policy if exists "Anyone can view prayer requests" on public.prayer_requests;
drop policy if exists "Users can create prayer requests" on public.prayer_requests;
drop policy if exists "Only admins can delete prayer requests" on public.prayer_requests;

-- Enable RLS and add strict policies for prayer_requests
alter table public.prayer_requests enable row level security;

-- Allow all authenticated users to read community requests
create policy "pr_select_all_auth"
  on public.prayer_requests
  for select
  to authenticated
  using (true);

-- Only allow owners to insert their own records
create policy "pr_insert_own"
  on public.prayer_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Owners or admins can update
create policy "pr_update_own_or_admin"
  on public.prayer_requests
  for update
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'))
  with check (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- Owners or admins can delete (for moderation)
create policy "pr_delete_own_or_admin"
  on public.prayer_requests
  for delete
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));