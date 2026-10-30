-- Datos iniciales de Triada. Ejecútalo después de 0001_init.sql.

-- 1. Cambia estos correos por los de las personas que van a usar la app.
insert into public.members (email) values
  ('tu-correo@ejemplo.com');

-- 2. Los sabores oficiales. Los precios quedan en 0 para que pongas los reales.
insert into public.recipes (name, description, color, image_url) values
  ('Dark chocolate', 'Galleta intensa en cacao, con un toque de café, chips de chocolate blanco y un centro de nutella.', '#4A2A1E', '/galletas/dark-chocolate.png'),
  ('Lemon cream pie', 'Galleta de limón con ralladura y jugo natural, rellena de crema de queso con limón y coronada con chocolate blanco.', '#E9C949', '/galletas/lemon-cream-pie.png'),
  ('Mashmellow', 'Galleta con chips de chocolate y marshmallow por dentro y por encima.', '#D8C3A5', '/galletas/mashmellow.png'),
  ('Oreo', 'Galleta de oreo triturada, rellena de nutella y coronada con crema.', '#2F2F35', '/galletas/oreo.png'),
  ('Red velvet', 'Suave, roja y con toque de cacao, con chips de chocolate blanco.', '#8E1B2C', '/galletas/red-velvet.png'),
  ('Triada cookies', 'La clásica, con chips de chocolate.', '#C98A3A', '/galletas/triada-cookies.png');

-- 3. Ingredientes comunes, en cero. Ajusta cantidades y mínimos desde la app.
insert into public.ingredients (name, unit) values
  ('Harina de trigo', 'g'),
  ('Azúcar morena', 'g'),
  ('Azúcar blanca', 'g'),
  ('Mantequilla', 'g'),
  ('Huevos', 'und'),
  ('Cacao en polvo', 'g'),
  ('Café instantáneo', 'g'),
  ('Chips de chocolate', 'g'),
  ('Chips de chocolate blanco', 'g'),
  ('Nutella', 'g'),
  ('Marshmallow', 'g'),
  ('Galletas Oreo', 'und'),
  ('Queso crema', 'g'),
  ('Limones', 'und'),
  ('Colorante rojo', 'ml'),
  ('Bicarbonato', 'g'),
  ('Sal', 'g'),
  ('Esencia de vainilla', 'ml');
