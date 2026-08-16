# NutriDía

**Tu plan, tu menú, tu progreso**

Aplicación web móvil-first para seguir un plan nutricional personalizado.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router v7
- Supabase (self-hosted, schema `nutridia`)
- PWA instalable

## Requisitos

- Node.js 18+
- npm
- Supabase self-hosted o cloud con schema `nutridia`

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` como `.env` y completa:

```
VITE_SUPABASE_URL=https://tu-supabase.com
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

**NUNCA** uses la `service_role` key en el frontend.

## Base de datos

### Schema

Todas las tablas viven en el schema `nutridia` (multi-tenant).

### Migraciones

Las migraciones están en `supabase/migrations/`:

1. `000_cleanup_and_schema.sql` - Crea el schema y permisos
2. `001_initial_schema.sql` - Todas las tablas, índices, RLS
3. `002_seed_data.sql` - Catálogo base + datos de Yajaira

### Ejecutar migraciones (VPS self-hosted)

```bash
# Subir archivos al VPS
scp supabase/migrations/*.sql root@IP_VPS:/tmp/

# Ejecutar
ssh root@IP_VPS
docker exec -i supabase-db psql -U postgres < /tmp/000_cleanup_and_schema.sql
docker exec -i supabase-db psql -U postgres < /tmp/001_initial_schema.sql
docker exec -i supabase-db psql -U postgres < /tmp/002_seed_data.sql
```

### Configurar PostgREST

Agregar `nutridia` a `PGRST_DB_SCHEMAS` en `/root/supabase/docker/.env`:

```
PGRST_DB_SCHEMAS=public,storage,graphql_public,...,nutridia
```

Reiniciar: `docker restart supabase-rest`

### Crear usuario Yajaira

1. Crear usuario vía Supabase Auth (signup con email/password)
2. Obtener el UUID del usuario creado
3. Actualizar el seed con el UUID real:
   ```sql
   UPDATE nutridia.profiles SET user_id = 'UUID-REAL' WHERE user_id = '00000000-0000-0000-0000-000000000001';
   UPDATE nutridia.nutrition_plans SET user_id = 'UUID-REAL' WHERE user_id = '00000000-0000-0000-0000-000000000001';
   -- (repetir para todas las tablas con user_id)
   ```

O ejecutar el seed completo con el UUID real desde el inicio.

## Ejecutar

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## PWA

La app es instalable como PWA. El manifest está en `public/manifest.json`.

## Estructura del proyecto

```
src/
  components/          # Design system (Button, Card, Input, etc.)
  features/            # Feature modules
  hooks/               # Custom hooks
  layouts/             # Layout components
  lib/                 # Supabase client, constants
  pages/               # All page components
  providers/           # AuthProvider
  services/            # Supabase service functions
  types/               # TypeScript types
  utils/               # Utility functions
supabase/
  migrations/          # SQL migrations + seed
public/
  brand/               # Brand assets (logos, icons)
```

## Reglas importantes

- El schema es `nutridia`, nunca `public`
- `auth.users` es compartido con otros proyectos
- RLS activo en todas las tablas
- La app NO inventa dietas ni cambia objetivos
- El catálogo de alimentos es solo lectura para usuarios normales
