# Enfoca Tu Ser

Aplicación web instalable de acompañamiento emocional construida con Next.js App Router, React, TypeScript y Supabase opcional.

Esta carpeta es la raíz independiente para GitHub y Vercel. No necesita archivos del workspace padre para compilar o funcionar.

## Funcionalidad

- 15 descubrimientos con desbloqueo secuencial.
- Fotografía Inicial y Fotografía Final con comparativa privada.
- Días de Presencia acumulados y Ritmo actual sin castigos.
- Soltar ahora, diario exportable y 12 prácticas de profundidad.
- Brújula Interior con etapas Oruga, Crisálida y Mariposa.
- Pases flexibles y transición amable de membresía.
- Detección y selección manual de zona horaria.
- Banner global de novedades.
- PWA instalable mediante `src/app/manifest.ts`.
- Administración aislada en `/admin/login` y `/admin`.

## Requisitos

- Node.js 22 o una versión compatible con Next.js 16.
- npm.

## Desarrollo local

```bash
npm install
npm run dev
```

La experiencia de usuaria funciona sin credenciales externas mediante `localStorage`. El panel administrativo requiere Supabase.

## Variables de entorno

Copia `.env.example` como `.env.local` y configura los valores necesarios:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GIFT_CHAT_URL=
NEXT_PUBLIC_SUPPORT_URL=
NEXT_PUBLIC_MEMBERSHIP_CHECKOUT_URL=
NEXT_PUBLIC_ENFORCE_SUBSCRIPTION=false
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

`NEXT_PUBLIC_ENFORCE_SUBSCRIPTION` permanece en `false` durante el lanzamiento inicial. No incluyas claves privadas ni `service_role` en variables públicas.

## Supabase

1. Revisa `supabase/schema.sql`.
2. Ejecútalo manualmente desde el SQL Editor de Supabase.
3. Crea la primera cuenta desde `/registro`.
4. Asigna el primer rol administrativo desde el SQL Editor:

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('tu-correo@ejemplo.com');
```

Después podrás entrar por `/admin/login`. El formulario administrativo solo admite correo y contraseña. El panel nunca consulta el contenido del diario.

## Verificación

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Despliegue

Conecta la raíz de esta carpeta a un repositorio de GitHub y selecciona ese repositorio en Vercel. Configura las mismas variables públicas en el proyecto de Vercel y usa el comando de compilación predeterminado de Next.js.
