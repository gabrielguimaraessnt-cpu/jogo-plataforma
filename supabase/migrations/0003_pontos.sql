-- Pontos no placar: caixas, flores, inimigos e alianças viram pontos; o ranking ordena por pontos.
alter table public.recordes add column if not exists pontos integer not null default 0;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'recordes_pontos_check') then
    alter table public.recordes add constraint recordes_pontos_check check (pontos between 0 and 10000000);
  end if;
end $$;
create index if not exists recordes_fase_pontos_idx on public.recordes (fase, pontos desc, tempo_ms);

create or replace function public.registrar_recorde(
  p_nome text, p_fase int, p_tempo_ms int, p_caixas int, p_frutas int, p_pontos int
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
  insert into recordes (nome, fase, tempo_ms, caixas, frutas, pontos)
  values (left(v_nome, 40), p_fase, p_tempo_ms, greatest(p_caixas, 0), greatest(p_frutas, 0), least(greatest(coalesce(p_pontos, 0), 0), 10000000))
  returning id into v_id;
  return v_id;
end $$;

revoke all on function public.registrar_recorde(text, int, int, int, int, int) from public;
grant execute on function public.registrar_recorde(text, int, int, int, int, int) to anon, authenticated;
