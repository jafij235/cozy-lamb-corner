-- Fix security warnings by setting search_path on new functions

-- Fix normalize_text function
create or replace function public.normalize_text(_t text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select regexp_replace(
    translate(lower(unaccent(coalesce(_t,''))),
      '0134578@$',
      'oieastbaas'
    ),
    '[^a-z0-9]+', '', 'g'
  );
$$;

-- Fix contains_profanity function
create or replace function public.contains_profanity(_t text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
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

-- Fix trigger function
create or replace function public.trg_prayer_requests_profanity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.contains_profanity(new.content) then
    raise exception 'Conteúdo contém linguagem inadequada';
  end if;
  return new;
end;
$$;