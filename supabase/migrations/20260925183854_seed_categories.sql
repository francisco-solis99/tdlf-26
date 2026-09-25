-- Seed the three tournament categories. Idempotent: re-running this
-- (or replaying it on an environment that already has them) inserts
-- nothing, thanks to ON CONFLICT on the unique name.
insert into categories (name, description) values
  ('libre', 'Abierta a todo jugador, sin importar edad o nivel.'),
  ('femenil', 'Exclusiva para jugadoras.'),
  ('masters', 'Solo hombres de 50 años o más.')
on conflict (name) do nothing;
