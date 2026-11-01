-- Dificuldade no placar: 0 = Bebezinho, 1 = Normal, 2 = Difícil.
alter table public.recordes add column if not exists dificuldade smallint not null default 1;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'recordes_dificuldade_check') then
    alter table public.recordes add constraint recordes_dificuldade_check check (dificuldade between 0 and 2);
  end if;
end $$;

create or replace function public.registrar_recorde(
  p_nome text, p_fase int, p_tempo_ms int, p_caixas int, p_frutas int, p_pontos int, p_dificuldade int
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nome text := btrim(regexp_replace(regexp_replace(coalesce(p_nome, ''), '[^[:alnum:] _.''-]', '', 'g'), '\s+', ' ', 'g'));
  v_id bigint;
begin
  if char_length(v_nome) < 2 then
    raise exception 'nome inválido';
  end if;
  if (select count(*) from recordes where criado_em > now() - interval '1 minute') >= 20 then
    raise exception 'muitos envios, tente daqui a pouco';
  end if;
  insert into recordes (nome, fase, tempo_ms, caixas, frutas, pontos, dificuldade)
  values (left(v_nome, 40), p_fase, p_tempo_ms, greatest(p_caixas, 0), greatest(p_frutas, 0),
          least(greatest(coalesce(p_pontos, 0), 0), 10000000), least(greatest(coalesce(p_dificuldade, 1), 0), 2))
  returning id into v_id;
  return v_id;
end $$;

revoke all on function public.registrar_recorde(text, int, int, int, int, int, int) from public;
grant execute on function public.registrar_recorde(text, int, int, int, int, int, int) to anon, authenticated;
