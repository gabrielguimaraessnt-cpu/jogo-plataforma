-- Placar online dos tempos por fase.
-- Leitura pública; gravação só pela função registrar_recorde (valida os dados).

create table if not exists public.recordes (
  id         bigint generated always as identity primary key,
  nome       text        not null check (char_length(nome) between 2 and 16),
  fase       smallint    not null check (fase between 1 and 99),
  tempo_ms   integer     not null check (tempo_ms between 5000 and 3600000),
  caixas     smallint    not null default 0 check (caixas >= 0),
  frutas     smallint    not null default 0 check (frutas >= 0),
  criado_em  timestamptz not null default now()
);

create index if not exists recordes_fase_tempo_idx on public.recordes (fase, tempo_ms);

alter table public.recordes enable row level security;

revoke insert, update, delete on public.recordes from anon, authenticated;
grant select on public.recordes to anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'recordes' and policyname = 'recordes_leitura_publica') then
    create policy recordes_leitura_publica on public.recordes for select to anon, authenticated using (true);
  end if;
end $$;

create or replace function public.registrar_recorde(
  p_nome text, p_fase int, p_tempo_ms int, p_caixas int, p_frutas int
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nome text := btrim(regexp_replace(coalesce(p_nome, ''), '[^[:alnum:] _.-]', '', 'g'));
  v_id bigint;
begin
  if char_length(v_nome) < 2 then
    raise exception 'nome inválido';
  end if;
  -- Limite simples contra spam: no máximo 20 envios por minuto no total.
  if (select count(*) from recordes where criado_em > now() - interval '1 minute') >= 20 then
    raise exception 'muitos envios, tente daqui a pouco';
  end if;
  insert into recordes (nome, fase, tempo_ms, caixas, frutas)
  values (left(v_nome, 16), p_fase, p_tempo_ms, greatest(p_caixas, 0), greatest(p_frutas, 0))
  returning id into v_id;
  return v_id;
end $$;

revoke all on function public.registrar_recorde(text, int, int, int, int) from public;
grant execute on function public.registrar_recorde(text, int, int, int, int) to anon, authenticated;
