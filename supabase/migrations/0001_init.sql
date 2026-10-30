-- Triada: esquema inicial
-- Pega este archivo completo en Supabase > SQL Editor y ejecútalo una vez.

-- Quién puede usar la app ------------------------------------------------
-- Solo los correos que estén en esta tabla pueden leer o escribir datos.
create table public.members (
  email text primary key
);
alter table public.members enable row level security;

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- Ingredientes -------------------------------------------------------------
create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null default 'g',
  quantity numeric not null default 0 check (quantity >= 0),
  min_quantity numeric not null default 0 check (min_quantity >= 0),
  created_at timestamptz not null default now()
);

-- Tipos de galletas (recetas) ---------------------------------------------
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  yield integer not null default 12 check (yield > 0),
  price integer not null default 0 check (price >= 0),
  color text not null default '#3F1208',
  image_url text,
  steps text,
  created_at timestamptz not null default now()
);

create table public.recipe_ingredients (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  ingredient_id uuid not null references public.ingredients (id) on delete cascade,
  quantity numeric not null check (quantity > 0),
  primary key (recipe_id, ingredient_id)
);

-- Pedidos ------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  due_at timestamptz,
  status text not null default 'pendiente' check (status in ('pendiente', 'entregado')),
  paid_amount integer not null default 0 check (paid_amount >= 0),
  notes text,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price integer not null default 0 check (unit_price >= 0)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index orders_status_due_idx on public.orders (status, due_at);

-- Deudas sueltas (fuera de un pedido) -------------------------------------
create table public.debts (
  id uuid primary key default gen_random_uuid(),
  person text not null,
  amount integer not null check (amount > 0),
  description text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- Descontar del stock una horneada -----------------------------------------
create or replace function public.bake_recipe(p_recipe uuid, p_batches numeric default 1)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.ingredients i
  set quantity = greatest(0, i.quantity - ri.quantity * p_batches)
  from public.recipe_ingredients ri
  where ri.recipe_id = p_recipe
    and ri.ingredient_id = i.id;
$$;

-- Seguridad ----------------------------------------------------------------
alter table public.ingredients enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.debts enable row level security;

create policy "equipo" on public.ingredients for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "equipo" on public.recipes for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "equipo" on public.recipe_ingredients for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "equipo" on public.orders for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "equipo" on public.order_items for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "equipo" on public.debts for all to authenticated using (public.is_member()) with check (public.is_member());

grant select, insert, update, delete on
  public.ingredients, public.recipes, public.recipe_ingredients,
  public.orders, public.order_items, public.debts
to authenticated;
grant execute on function public.is_member() to authenticated;
grant execute on function public.bake_recipe(uuid, numeric) to authenticated;
revoke execute on function public.bake_recipe(uuid, numeric) from anon, public;
