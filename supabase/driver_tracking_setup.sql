-- RideConnect live driver tracking support
-- Run this once in the Supabase SQL Editor for the same project used by the app.
-- It is additive: it does not delete or replace existing RideConnect tables.

create table if not exists public.driver_locations (
  ride_id uuid primary key references public.rides(id) on delete cascade,
  driver_id uuid not null,
  latitude double precision not null,
  longitude double precision not null,
  heading double precision,
  updated_at timestamptz not null default now()
);

create index if not exists driver_locations_driver_id_idx
  on public.driver_locations(driver_id);

alter table public.driver_locations enable row level security;

-- Re-running this file is safe.
drop policy if exists "Drivers manage own live location" on public.driver_locations;
create policy "Drivers manage own live location"
on public.driver_locations
for all
to authenticated
using (auth.uid() = driver_id)
with check (auth.uid() = driver_id);

drop policy if exists "Booked riders view live driver location" on public.driver_locations;
create policy "Booked riders view live driver location"
on public.driver_locations
for select
to authenticated
using (
  exists (
    select 1
    from public.bookings b
    where b.ride_id = driver_locations.ride_id
      and b.rider_id = auth.uid()
      and b.status in ('confirmed', 'completed')
  )
);

grant select, insert, update, delete
  on public.driver_locations
  to authenticated;

-- Supabase Realtime needs this table in the realtime publication.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'driver_locations'
  ) then
    alter publication supabase_realtime add table public.driver_locations;
  end if;
end
$$;

-- RideConnect's application code uses these ride status values:
-- available, accepted, driver_on_way, driver_arrived, in_progress,
-- completed, cancelled (and tolerates legacy 'active').
-- If rides.status is protected by a custom CHECK constraint or enum in your
-- existing database, make sure those values are allowed before testing the
-- four-stage driver trip flow. This file intentionally does not drop or
-- rewrite an unknown existing status constraint.
