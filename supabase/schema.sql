-- Enfoca Tu Ser
-- Esquema manual para ejecutar en el SQL Editor de Supabase.
-- No activa Realtime y no almacena el catálogo estático.

begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  billing_email text,
  display_name text,
  role text not null default 'user',
  last_compass_emotion text not null default 'Temor',
  timezone text,
  timezone_manual boolean not null default false,
  presence_days_count integer not null default 1,
  current_rhythm_count integer not null default 1,
  last_active_date date default current_date,
  gift_unlocked_at timestamptz,
  plan_type text not null default 'trial',
  subscription_status text not null default 'trial',
  systeme_contact_id text,
  access_until timestamptz not null default (now() + interval '7 days'),
  reminder_enabled boolean not null default false,
  reminder_times text[] not null default '{}'::text[],
  push_subscription jsonb,
  created_at timestamptz not null default now()
);

-- Actualización repetible para instalaciones que ya tenían la primera versión.
alter table public.profiles
  add column if not exists billing_email text,
  add column if not exists timezone text,
  add column if not exists timezone_manual boolean default false,
  add column if not exists presence_days_count integer default 1,
  add column if not exists current_rhythm_count integer default 1,
  add column if not exists last_active_date date default current_date,
  add column if not exists plan_type text default 'trial',
  add column if not exists access_until timestamptz,
  add column if not exists reminder_enabled boolean default false,
  add column if not exists reminder_times text[] default '{}'::text[],
  add column if not exists push_subscription jsonb;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'access_validated_until'
  ) then
    execute $migration$
      update public.profiles
      set access_until = coalesce(access_until, access_validated_until)
      where access_until is null
    $migration$;
  end if;
end;
$$;

update public.profiles
set
  last_compass_emotion = coalesce(nullif(last_compass_emotion, ''), 'Temor'),
  timezone_manual = coalesce(timezone_manual, false),
  presence_days_count = greatest(coalesce(presence_days_count, 1), 1),
  current_rhythm_count = greatest(coalesce(current_rhythm_count, 1), 1),
  plan_type = coalesce(plan_type, 'trial'),
  subscription_status = coalesce(subscription_status, 'trial'),
  access_until = coalesce(access_until, now() + interval '7 days'),
  reminder_enabled = coalesce(reminder_enabled, false),
  reminder_times = coalesce(reminder_times, '{}'::text[]);

alter table public.profiles
  alter column role set default 'user',
  alter column role set not null,
  alter column last_compass_emotion set default 'Temor',
  alter column last_compass_emotion set not null,
  alter column timezone_manual set default false,
  alter column timezone_manual set not null,
  alter column presence_days_count set default 1,
  alter column presence_days_count set not null,
  alter column current_rhythm_count set default 1,
  alter column current_rhythm_count set not null,
  alter column last_active_date set default current_date,
  alter column plan_type set default 'trial',
  alter column plan_type set not null,
  alter column subscription_status set default 'trial',
  alter column subscription_status set not null,
  alter column access_until set default (now() + interval '7 days'),
  alter column access_until set not null,
  alter column reminder_enabled set default false,
  alter column reminder_enabled set not null,
  alter column reminder_times set default '{}'::text[],
  alter column reminder_times set not null;

alter table public.profiles
  drop constraint if exists profiles_role_check,
  drop constraint if exists profiles_plan_type_check,
  drop constraint if exists profiles_subscription_status_check,
  drop constraint if exists profiles_presence_days_count_check,
  drop constraint if exists profiles_current_rhythm_count_check;

alter table public.profiles
  add constraint profiles_role_check
    check (role in ('user', 'admin')),
  add constraint profiles_plan_type_check
    check (plan_type in ('free_beta', 'trial', 'promo_pass', 'member', 'lifetime')),
  add constraint profiles_subscription_status_check
    check (subscription_status in ('trial', 'active', 'grace_period', 'inactive')),
  add constraint profiles_presence_days_count_check
    check (presence_days_count >= 1),
  add constraint profiles_current_rhythm_count_check
    check (current_rhythm_count >= 1);

alter table public.profiles
  drop column if exists access_validated_until;

create unique index if not exists profiles_email_unique_idx
  on public.profiles (lower(email));

create unique index if not exists profiles_billing_email_unique_idx
  on public.profiles (lower(billing_email))
  where billing_email is not null;

create index if not exists profiles_last_active_date_idx
  on public.profiles (last_active_date desc);

create index if not exists profiles_gift_unlocked_idx
  on public.profiles (gift_unlocked_at)
  where gift_unlocked_at is not null;

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_type text not null,
  item_index smallint not null,
  completed_at timestamptz not null default now(),
  constraint user_progress_item_type_check
    check (item_type in ('discovery', 'extra')),
  constraint user_progress_item_range_check
    check (
      (item_type = 'discovery' and item_index between 0 and 14)
      or
      (item_type = 'extra' and item_index between 0 and 11)
    ),
  constraint user_progress_user_item_unique
    unique (user_id, item_type, item_index)
);

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  feeling text not null,
  situation text,
  body_place text,
  thoughts_released text[] not null default '{}'::text[],
  intensity_before smallint not null,
  intensity_after smallint not null,
  release_note text,
  created_at timestamptz not null default now(),
  constraint practice_sessions_intensity_before_check
    check (intensity_before between 0 and 10),
  constraint practice_sessions_intensity_after_check
    check (intensity_after between 0 and 10)
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entry_type text not null,
  item_index smallint,
  title text not null,
  content text not null,
  practice_session_id uuid references public.practice_sessions (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint journal_entries_type_check
    check (entry_type in ('free', 'discovery', 'extra', 'practice')),
  constraint journal_entries_item_index_check
    check (
      (entry_type in ('free', 'practice') and item_index is null)
      or
      (entry_type = 'discovery' and item_index between 0 and 14)
      or
      (entry_type = 'extra' and item_index between 0 and 11)
    ),
  constraint journal_entries_practice_link_check
    check (practice_session_id is null or entry_type = 'practice')
);

create table if not exists public.user_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stage text not null,
  calm_score smallint not null,
  self_kindness_score smallint not null,
  clarity_score smallint not null,
  peace_score smallint not null,
  reflection_note text,
  created_at timestamptz not null default now(),
  constraint user_assessments_stage_check
    check (stage in ('initial', 'final')),
  constraint user_assessments_calm_score_check
    check (calm_score between 1 and 10),
  constraint user_assessments_self_kindness_score_check
    check (self_kindness_score between 1 and 10),
  constraint user_assessments_clarity_score_check
    check (clarity_score between 1 and 10),
  constraint user_assessments_peace_score_check
    check (peace_score between 1 and 10),
  constraint user_assessments_user_stage_unique
    unique (user_id, stage)
);

create table if not exists public.app_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  cta_label text,
  cta_url text,
  variant text not null default 'warm',
  is_active boolean not null default true,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now(),
  constraint app_announcements_variant_check
    check (variant in ('warm', 'butterfly', 'deep')),
  constraint app_announcements_window_check
    check (ends_at is null or starts_at is null or ends_at > starts_at)
);

-- Índices para claves foráneas, RLS, cursores y agregaciones.
create index if not exists practice_sessions_user_created_idx
  on public.practice_sessions (user_id, created_at desc, id desc);

create index if not exists journal_entries_user_created_idx
  on public.journal_entries (user_id, created_at desc, id desc);

create index if not exists journal_entries_practice_session_idx
  on public.journal_entries (practice_session_id)
  where practice_session_id is not null;

create index if not exists user_assessments_user_id_idx
  on public.user_assessments (user_id);

create index if not exists app_announcements_active_schedule_idx
  on public.app_announcements (starts_at desc, ends_at)
  where is_active = true;

-- Perfil automático después de crear una identidad en Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(new.email));
begin
  if v_email is null or v_email = '' then
    raise exception 'La cuenta necesita un correo válido.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.profiles as profile
    where profile.billing_email is not null
      and lower(profile.billing_email) = v_email
      and profile.id <> new.id
  ) then
    raise exception 'Este correo ya está vinculado a otra cuenta.' using errcode = '23505';
  end if;

  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    v_email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(v_email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Vinculación segura del correo de compra.
create or replace function public.claim_billing_email(p_billing_email text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_billing_email text := lower(trim(p_billing_email));
begin
  if v_user_id is null then
    raise exception 'Necesitas iniciar sesión para vincular tu correo de compra.' using errcode = '28000';
  end if;

  if v_billing_email is null
    or v_billing_email = ''
    or length(v_billing_email) > 320
    or v_billing_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  then
    raise exception 'Ingresa un correo de compra válido.' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_billing_email, 0)
  );

  if exists (
    select 1
    from public.profiles as profile
    where profile.id <> v_user_id
      and (
        lower(profile.email) = v_billing_email
        or lower(profile.billing_email) = v_billing_email
      )
  ) then
    raise exception 'Este correo de compra ya está vinculado a otra cuenta.' using errcode = '23505';
  end if;

  update public.profiles as profile
  set billing_email = v_billing_email
  where profile.id = v_user_id;

  if not found then
    raise exception 'No encontramos tu perfil. Vuelve a iniciar sesión.' using errcode = 'P0002';
  end if;

  return v_billing_email;
end;
$$;

revoke execute on function public.claim_billing_email(text) from public, anon;
grant execute on function public.claim_billing_email(text) to authenticated;

-- Métricas agregadas para el panel administrativo.
create or replace function public.admin_get_dashboard_stats()
returns table (
  total_users bigint,
  active_last_7_days bigint,
  gift_unlocked_count bigint,
  completed_path_count bigint,
  total_pauses bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.profiles as caller
    where caller.id = auth.uid()
      and caller.role = 'admin'
  ) then
    raise exception 'Acceso reservado al equipo administrador.' using errcode = '42501';
  end if;

  return query
  select
    (select count(*) from public.profiles),
    (
      select count(*)
      from public.profiles as profile
      where profile.last_active_date >= current_date - 6
    ),
    (
      select count(*)
      from public.profiles as profile
      where profile.gift_unlocked_at is not null
    ),
    (
      select count(distinct progress.user_id)
      from public.user_progress as progress
      where progress.item_type = 'discovery'
        and progress.item_index = 14
    ),
    (select count(*) from public.practice_sessions);
end;
$$;

revoke execute on function public.admin_get_dashboard_stats() from public, anon;
grant execute on function public.admin_get_dashboard_stats() to authenticated;

-- Listado administrativo sin títulos, notas ni contenido del diario.
create or replace function public.admin_list_users(p_search text default '')
returns table (
  id uuid,
  display_name text,
  email text,
  billing_email text,
  role text,
  completed_steps bigint,
  current_step integer,
  presence_days_count integer,
  current_rhythm_count integer,
  plan_type text,
  subscription_status text,
  access_until timestamptz,
  last_active_date date,
  gift_unlocked_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_search text := lower(trim(coalesce(p_search, '')));
begin
  if auth.uid() is null or not exists (
    select 1
    from public.profiles as caller
    where caller.id = auth.uid()
      and caller.role = 'admin'
  ) then
    raise exception 'Acceso reservado al equipo administrador.' using errcode = '42501';
  end if;

  return query
  select
    profile.id,
    profile.display_name,
    profile.email,
    profile.billing_email,
    profile.role,
    coalesce(progress.completed_steps, 0)::bigint,
    case
      when coalesce(progress.completed_steps, 0) >= 15 then 15
      else coalesce(progress.completed_steps, 0)::integer + 1
    end as current_step,
    profile.presence_days_count,
    profile.current_rhythm_count,
    profile.plan_type,
    profile.subscription_status,
    profile.access_until,
    profile.last_active_date,
    profile.gift_unlocked_at,
    profile.created_at
  from public.profiles as profile
  left join lateral (
    select count(*) as completed_steps
    from public.user_progress as item
    where item.user_id = profile.id
      and item.item_type = 'discovery'
  ) as progress on true
  where v_search = ''
    or position(v_search in lower(coalesce(profile.display_name, ''))) > 0
    or position(v_search in lower(profile.email)) > 0
    or position(v_search in lower(coalesce(profile.billing_email, ''))) > 0
  order by profile.created_at desc, profile.id;
end;
$$;

revoke execute on function public.admin_list_users(text) from public, anon;
grant execute on function public.admin_list_users(text) to authenticated;

-- Gestión validada de planes, días de acceso y rol administrativo.
create or replace function public.admin_update_user_access(
  p_target_user_id uuid,
  p_plan_type text default null,
  p_add_days integer default null,
  p_new_role text default null
)
returns table (
  id uuid,
  role text,
  plan_type text,
  subscription_status text,
  access_until timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.profiles as caller
    where caller.id = auth.uid()
      and caller.role = 'admin'
  ) then
    raise exception 'Acceso reservado al equipo administrador.' using errcode = '42501';
  end if;

  if p_target_user_id is null then
    raise exception 'Selecciona una usuaria.' using errcode = '22023';
  end if;

  if p_plan_type is not null
    and p_plan_type not in ('free_beta', 'trial', 'promo_pass', 'member', 'lifetime')
  then
    raise exception 'El tipo de pase no es válido.' using errcode = '22023';
  end if;

  if p_add_days is not null and p_add_days not in (7, 30, 60, 90) then
    raise exception 'Los días permitidos son 7, 30, 60 o 90.' using errcode = '22023';
  end if;

  if p_new_role is not null and p_new_role <> 'admin' then
    raise exception 'Esta acción solo permite asignar el rol admin.' using errcode = '22023';
  end if;

  if p_plan_type is null and p_add_days is null and p_new_role is null then
    raise exception 'Elige al menos un cambio para aplicar.' using errcode = '22023';
  end if;

  return query
  update public.profiles as target
  set
    plan_type = coalesce(p_plan_type, target.plan_type),
    access_until = case
      when p_plan_type = 'lifetime' then target.access_until
      when p_add_days is not null
        then greatest(target.access_until, now()) + pg_catalog.make_interval(days => p_add_days)
      else target.access_until
    end,
    subscription_status = case
      when p_plan_type = 'trial' then 'trial'
      when p_plan_type is not null or p_add_days is not null then 'active'
      else target.subscription_status
    end,
    role = coalesce(p_new_role, target.role)
  where target.id = p_target_user_id
  returning
    target.id,
    target.role,
    target.plan_type,
    target.subscription_status,
    target.access_until;

  if not found then
    raise exception 'No encontramos la usuaria seleccionada.' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.admin_update_user_access(uuid, text, integer, text)
  from public, anon;
grant execute on function public.admin_update_user_access(uuid, text, integer, text)
  to authenticated;

-- RLS en todas las tablas expuestas.
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.user_progress enable row level security;
alter table public.user_progress force row level security;
alter table public.practice_sessions enable row level security;
alter table public.practice_sessions force row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_entries force row level security;
alter table public.user_assessments enable row level security;
alter table public.user_assessments force row level security;
alter table public.app_announcements enable row level security;
alter table public.app_announcements force row level security;

-- Grants mínimos y explícitos para Data API.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.user_progress from anon, authenticated;
revoke all on table public.practice_sessions from anon, authenticated;
revoke all on table public.journal_entries from anon, authenticated;
revoke all on table public.user_assessments from anon, authenticated;
revoke all on table public.app_announcements from anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select on table public.profiles to authenticated;
grant insert (
  id,
  email,
  display_name,
  last_compass_emotion,
  timezone,
  timezone_manual,
  presence_days_count,
  current_rhythm_count,
  last_active_date,
  gift_unlocked_at,
  reminder_enabled,
  reminder_times,
  push_subscription
) on table public.profiles to authenticated;
grant update (
  display_name,
  last_compass_emotion,
  timezone,
  timezone_manual,
  presence_days_count,
  current_rhythm_count,
  last_active_date,
  gift_unlocked_at,
  reminder_enabled,
  reminder_times,
  push_subscription
) on table public.profiles to authenticated;

grant select, insert, update, delete
  on table public.user_progress to authenticated;
grant select, insert, update, delete
  on table public.practice_sessions to authenticated;
grant select, insert, update, delete
  on table public.journal_entries to authenticated;
grant select, insert, update, delete
  on table public.user_assessments to authenticated;
grant select on table public.app_announcements to anon, authenticated;
grant insert, update, delete on table public.app_announcements to authenticated;

-- Políticas de profiles.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Políticas de user_progress.
drop policy if exists user_progress_select_own on public.user_progress;
create policy user_progress_select_own
  on public.user_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists user_progress_insert_own on public.user_progress;
create policy user_progress_insert_own
  on public.user_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists user_progress_update_own on public.user_progress;
create policy user_progress_update_own
  on public.user_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists user_progress_delete_own on public.user_progress;
create policy user_progress_delete_own
  on public.user_progress
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Políticas de practice_sessions.
drop policy if exists practice_sessions_select_own on public.practice_sessions;
create policy practice_sessions_select_own
  on public.practice_sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists practice_sessions_insert_own on public.practice_sessions;
create policy practice_sessions_insert_own
  on public.practice_sessions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists practice_sessions_update_own on public.practice_sessions;
create policy practice_sessions_update_own
  on public.practice_sessions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists practice_sessions_delete_own on public.practice_sessions;
create policy practice_sessions_delete_own
  on public.practice_sessions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Políticas de journal_entries.
drop policy if exists journal_entries_select_own on public.journal_entries;
create policy journal_entries_select_own
  on public.journal_entries
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists journal_entries_insert_own on public.journal_entries;
create policy journal_entries_insert_own
  on public.journal_entries
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists journal_entries_update_own on public.journal_entries;
create policy journal_entries_update_own
  on public.journal_entries
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists journal_entries_delete_own on public.journal_entries;
create policy journal_entries_delete_own
  on public.journal_entries
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Políticas de user_assessments.
drop policy if exists user_assessments_select_own on public.user_assessments;
create policy user_assessments_select_own
  on public.user_assessments
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists user_assessments_insert_own on public.user_assessments;
create policy user_assessments_insert_own
  on public.user_assessments
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists user_assessments_update_own on public.user_assessments;
create policy user_assessments_update_own
  on public.user_assessments
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists user_assessments_delete_own on public.user_assessments;
create policy user_assessments_delete_own
  on public.user_assessments
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Lectura pública de anuncios vigentes.
drop policy if exists app_announcements_select_active on public.app_announcements;
create policy app_announcements_select_active
  on public.app_announcements
  for select
  to anon, authenticated
  using (
    is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

-- Los perfiles administradores también leen anuncios inactivos o programados.
drop policy if exists app_announcements_select_admin on public.app_announcements;
create policy app_announcements_select_admin
  on public.app_announcements
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles as caller
      where caller.id = (select auth.uid())
        and caller.role = 'admin'
    )
  );

drop policy if exists app_announcements_insert_admin on public.app_announcements;
create policy app_announcements_insert_admin
  on public.app_announcements
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles as caller
      where caller.id = (select auth.uid())
        and caller.role = 'admin'
    )
  );

drop policy if exists app_announcements_update_admin on public.app_announcements;
create policy app_announcements_update_admin
  on public.app_announcements
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles as caller
      where caller.id = (select auth.uid())
        and caller.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles as caller
      where caller.id = (select auth.uid())
        and caller.role = 'admin'
    )
  );

drop policy if exists app_announcements_delete_admin on public.app_announcements;
create policy app_announcements_delete_admin
  on public.app_announcements
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles as caller
      where caller.id = (select auth.uid())
        and caller.role = 'admin'
    )
  );

commit;

-- Verificación manual sugerida después de ejecutar:
-- 1. Confirmar RLS y grants de las seis tablas.
-- 2. Crear dos usuarias de prueba y comprobar aislamiento de filas.
-- 3. Probar colisiones de email y billing_email entre ambas cuentas.
-- 4. Confirmar que una usuaria normal no ejecuta las tres RPC administrativas.
-- 5. Confirmar que las RPC administrativas no devuelven contenido del diario.
-- 6. Verificar el cursor del diario con límite 20 y su índice compuesto.
