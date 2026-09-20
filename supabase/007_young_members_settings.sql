-- Incremental migration #7 — run after 006_site_settings.sql.
--
-- Two more editable settings for the home page card that lists the family's
-- youngest members: its heading, and the age limit ("younger than N years").
-- Blank / NULL means the built-in default ("Little Ones", younger than 5).
--
-- Purely additive: two new nullable columns, no existing data is touched.

alter table public.site_settings
  add column young_title text,
  add column young_max_age smallint check (young_max_age between 1 and 18);
