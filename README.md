# Triada

App para el celular de Triada cookies: stock de ingredientes, lista de compras, recetas, pedidos y quién debe.

Hecha con Next.js (se instala en el celular como app), Supabase (datos y login) y Vercel (publicación).

## Qué hace

- **Stock:** cantidad y mínimo de cada ingrediente, con aviso de Falta / Poco / Bien.
- **Lista de compras:** se calcula con los mínimos y con lo que piden los pedidos pendientes según las recetas. "Ya compré" lo suma al stock y la lista se puede compartir por WhatsApp.
- **Recetas:** ingredientes por tanda, preparación, precio y rendimiento. Muestra si el stock alcanza, y "Registrar horneada" descuenta lo usado.
- **Pedidos:** pendientes y entregados por día, con abonos y pagos.
- **Quién debe:** junta los pedidos entregados sin pagar y las deudas anotadas a mano, agrupados por persona.

## Poner en marcha

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta `supabase/migrations/0001_init.sql`.
3. Abre `supabase/seed.sql`, cambia `tu-correo@ejemplo.com` por los correos del equipo y ejecútalo. Así se crean los 6 sabores y los ingredientes básicos.
4. En **Authentication > Users**, crea el usuario de cada persona (correo y contraseña).
5. En **Authentication > Sign In / Providers**, desactiva "Allow new users to sign up". Así nadie más puede crear una cuenta. Igual, solo los correos de la tabla `members` pueden ver los datos.

### 2. En tu computador

```bash
cp .env.example .env.local   # y pega la URL y la publishable key del proyecto
npm install
npm run dev
```

Abre http://localhost:3000.

### 3. Vercel

1. Sube el repositorio a GitHub.
2. En [vercel.com](https://vercel.com), importa el repositorio.
3. Agrega las variables `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`.
4. Despliega. Cada `git push` a `main` publica una versión nueva.

### Instalar en el celular

Abre la URL de Vercel en el celular:

- **Android (Chrome):** menú ⋮ > *Instalar app*.
- **iPhone (Safari):** compartir > *Agregar a inicio*.

## Para agregar a alguien al equipo

1. En SQL Editor: `insert into public.members (email) values ('correo@ejemplo.com');`
2. Crea su usuario en Authentication > Users.
