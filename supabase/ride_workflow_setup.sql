-- RideConnect rider <-> driver workflow support
-- Run once in the Supabase SQL Editor before testing the repaired trip flow.
-- This script keeps existing rows and only normalises the rides.status values,
-- timing columns, and Realtime publication needed by the app.

-- The current UI/receipt/history code reads these timestamps. Adding them is
-- harmless when they already exist.
alter table public.rides
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz;

-- Allow every ride state used by the app. Support both an enum-backed status
-- column and the more common text/varchar + CHECK-constraint setup.
do $$
declare
  status_data_type text;
  status_udt_schema text;
  status_udt_name text;
  constraint_row record;
  status_value text;
begin
  select data_type, udt_schema, udt_name
    into status_data_type, status_udt_schema, status_udt_name
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'rides'
    and column_name = 'status';

  if status_data_type is null then
    raise exception 'public.rides.status does not exist';
  end if;

  if status_data_type = 'USER-DEFINED' then
    foreach status_value in array array[
      'available',
      'accepted',
      'active',
      'driver_on_way',
      'driver_arrived',
      'in_progress',
      'completed',
      'cancelled'
    ]
    loop
      execute format(
        'alter type %I.%I add value if not exists %L',
        status_udt_schema,
        status_udt_name,
        status_value
      );
    end loop;
  elsif status_data_type in ('text', 'character varying', 'character') then
    -- Remove existing CHECK constraints that govern rides.status so the
    -- repaired workflow is not rejected by an older list of values.
    for constraint_row in
      select c.conname
      from pg_constraint c
      where c.conrelid = 'public.rides'::regclass
        and c.contype = 'c'
        and pg_get_constraintdef(c.oid) ilike '%status%'
    loop
      execute format(
        'alter table public.rides drop constraint %I',
        constraint_row.conname
      );
    end loop;

    alter table public.rides
      add constraint rides_status_check
      check (
        status in (
          'available',
          'accepted',
          'active',
          'driver_on_way',
          'driver_arrived',
          'in_progress',
          'completed',
          'cancelled'
        )
      );
  end if;
end
$$;

-- Rider notifications/status changes use Supabase Postgres Changes. Add the
-- core tables to the Realtime publication only when they are not already in it.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rides'
  ) then
    alter publication supabase_realtime add table public.rides;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end
$$;
