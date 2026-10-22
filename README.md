# Enfoca Tu Ser

Aplicación web instalable de acompañamiento emocional construida con Next.js App Router, React, TypeScript y Supabase opcional.

Esta carpeta es la raíz independiente para GitHub y Vercel. No necesita archivos del workspace padre para compilar o funcionar.

## Funcionalidad

- 15 descubrimientos con desbloqueo secuencial.
- Integración temporal centralizada: 1 minuto en desarrollo y Vercel Preview, 12 horas en producción.
- Invitaciones **Llévalo contigo** disponibles durante cada integración.
- Fotografía Inicial y Fotografía Final con comparativa privada.
- Días de Presencia acumulados y Ritmo actual sin castigos.
- Soltar ahora, diario exportable y 12 prácticas de profundidad.
- Brújula Interior con etapas Oruga, Crisálida y Mariposa.
- Pases flexibles y transición amable de membresía.
- Detección y selección manual de zona horaria.
- Banner global de novedades.
- PWA instalable mediante `src/app/manifest.ts`.
- Avisos discretos dentro de la aplicación y permiso opcional para avisos del dispositivo.
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

La sincronización usa espacios locales separados para invitada y para cada UUID
autenticado. Al iniciar sesión, el espacio invitado se reclama para una sola
cuenta antes de subirlo y solo se elimina después de una sincronización completa.
Las claves heredadas se consumen únicamente después de copiarlas al espacio
nuevo, y una reclamación interrumpida puede retomarse sin duplicar titulares.
Las escrituras remotas son seriales, las respuestas obsoletas se descartan y las
eliminaciones pendientes se conservan como tombstones hasta ser confirmadas.
El diario pagina por el cursor de la última fila remota recibida y solicita una
fila adicional para determinar si existe otra página sin falsos positivos.

### Límite de validación temporal del piloto

La interfaz, las URLs y las acciones de progreso consumen la misma política pura
de desbloqueo. Para cuentas autenticadas, `completed_at` se sincroniza con
Supabase y continúa siendo la fuente temporal. Sin embargo, el esquema actual
permite que la propietaria escriba sus filas de `user_progress` desde el cliente.
Por eso, este control evita adelantos mediante la aplicación normal, pero no es
una barrera de seguridad inviolable frente a un cliente modificado.

Garantizar la espera en servidor requerirá una RPC o función confiable que
valide el paso previo y la hora del servidor, junto con la revocación de las
escrituras directas equivalentes. Ese cambio de políticas debe revisarse y
ejecutarse manualmente con autorización; este piloto no modifica infraestructura
ni ejecuta SQL.

Estrategia de conflictos:

- progreso: unión por tipo e índice, conservando la fecha de finalización más antigua;
- diario y prácticas: registros inmutables por UUID, con servidor autoritativo ante una colisión;
- evaluaciones: gana la versión con `createdAt` más reciente;
- perfil: servidor autoritativo salvo campos locales marcados explícitamente como pendientes;
- eliminaciones: el tombstone local vence a una fila remota hasta que Supabase confirma el borrado.

### Comprobación de RLS en cada entorno

`supabase/schema.sql` es la definición esperada, pero no demuestra el estado de
producción. Después de aplicarlo manualmente, ejecuta estas consultas de solo
lectura en el SQL Editor:

Este PR solo modifica las políticas `profiles_insert_own`,
`journal_entries_insert_own` y `journal_entries_update_own`. No se debe ejecutar
el archivo completo directamente en producción: contiene DDL histórico ajeno a
este cambio. Para aplicar el endurecimiento sin modificar datos, extrae únicamente
los bloques `drop policy if exists` y `create policy` de esas tres políticas,
revísalos y pruébalos primero en un proyecto no productivo. Su aplicación debe ser
manual, en una transacción y con autorización explícita para ese entorno.

```sql
select
  relname,
  relrowsecurity as rls_enabled,
  relforcerowsecurity as rls_forced
from pg_catalog.pg_class
where relnamespace = 'public'::regnamespace
  and relname in (
    'profiles',
    'user_progress',
    'practice_sessions',
    'journal_entries',
    'user_assessments',
    'app_announcements'
  )
order by relname;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_catalog.pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;
```

Luego valida con dos cuentas reales de prueba mediante el cliente público: cada
cuenta debe poder crear, leer, modificar y borrar solo sus filas. El SQL Editor
usa un rol privilegiado y por sí solo no prueba el aislamiento RLS.

### Reversión

El cambio de frontend se revierte desplegando el commit anterior. Las claves
locales por cuenta no se borran al revertir. Los cambios SQL solo endurecen
políticas existentes y pueden revertirse restaurando las definiciones anteriores
de `profiles_insert_own`, `journal_entries_insert_own` y
`journal_entries_update_own`; no hay migraciones destructivas ni cambios de datos.

## Despliegue

Conecta la raíz de esta carpeta a un repositorio de GitHub y selecciona ese repositorio en Vercel. Configura las mismas variables públicas en el proyecto de Vercel y usa el comando de compilación predeterminado de Next.js.

El repositorio no contiene comandos de migración automática. Un despliegue
Preview debe limitarse a `next build`, no debe ejecutar `supabase db push`,
scripts SQL ni operaciones destructivas, y debe usar variables de un entorno no
productivo antes de habilitar pruebas que escriban datos.

## PWA y notificaciones del piloto

El manifiesto usa exclusivamente iconos oficiales locales y `public/sw.js`
registra el shell instalable. Cuando la aplicación permanece abierta, reevalúa
el desbloqueo en el instante previsto y puede mostrar un aviso genérico del
dispositivo si la usuaria activó voluntariamente esa preferencia. Los mensajes
no incluyen notas, emociones ni otro contenido privado.

El service worker deja preparado el evento `push`, pero el envío con la
aplicación cerrada todavía no está operativo: faltan un emisor confiable, claves
VAPID, alta y baja de suscripciones y un programador de entregas. No se simula
esa capacidad durante el piloto.
