-- Nome e sobrenome no placar: aumenta o limite do nome de 16 para 40 letras.
alter table public.recordes drop constraint if exists recordes_nome_check;
alter table public.recordes add constraint recordes_nome_check check (char_length(nome) between 2 and 40);

create or replace function public.registrar_recorde(
  p_nome text, p_fase int, p_tempo_ms int, p_caixas int, p_frutas int
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
  -- Limite simples contra spam: no máximo 20 envios por minuto no total.
  if (select count(*) from recordes where criado_em > now() - interval '1 minute') >= 20 then
    raise exception 'muitos envios, tente daqui a pouco';
  end if;
  insert into recordes (nome, fase, tempo_ms, caixas, frutas)
  values (left(v_nome, 40), p_fase, p_tempo_ms, greatest(p_caixas, 0), greatest(p_frutas, 0))
  returning id into v_id;
  return v_id;
end $$;

revoke all on function public.registrar_recorde(text, int, int, int, int) from public;
grant execute on function public.registrar_recorde(text, int, int, int, int) to anon, authenticated;
