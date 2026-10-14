-- JD NAILS — reforço da regra: uma data ativa por vez
-- Execute UMA VEZ no SQL Editor do Supabase.
--
-- 1) Retorna apenas datas ocupadas, sem expor dados pessoais.
create or replace function public.datas_ocupadas(p_inicio date, p_fim date)
returns table(data date)
language sql
security definer
set search_path = public
as $$
  select distinct a.data
  from public.agendamentos a
  where a.data between p_inicio and p_fim
    and lower(coalesce(a.status, 'pendente')) <> 'cancelado'
  order by a.data;
$$;

grant execute on function public.datas_ocupadas(date, date) to anon, authenticated;

-- 2) Impede dois agendamentos ativos na mesma data no nível do banco.
-- Se já existirem duas reservas ativas na mesma data, resolva/cancele a duplicada
-- antes de executar este CREATE INDEX.
create unique index if not exists agendamentos_uma_data_ativa_uidx
on public.agendamentos (data)
where lower(coalesce(status, 'pendente')) <> 'cancelado';
