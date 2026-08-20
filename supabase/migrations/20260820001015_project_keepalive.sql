create or replace function public.project_keepalive()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'ok', true,
    'checked_at', now()
  );
$$;

revoke all on function public.project_keepalive() from public;
grant execute on function public.project_keepalive() to anon, authenticated;

comment on function public.project_keepalive() is
  'Minimal read-only health check used by the scheduled keepalive workflow; returns no user data.';
