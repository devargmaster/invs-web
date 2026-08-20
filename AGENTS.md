# AGENTS.md

Ver `CLAUDE.md` en esta misma carpeta para arquitectura completa del
proyecto (stack, servicios, patrones de checkout/auth/streaming). Este
archivo es la bitácora de estado compartida entre Claude Code (otra
terminal) y opencode — actualizarlo acá en vez de repetir contexto de
palabra.

## Qué es INVS

Plataforma de eventos de Panda Estudios, 4 repos hermanos en
`/Users/warce/Documents/Cosas de Panda/Proyectos/Eventos/`:
`invs-backend` (NestJS+Prisma+Supabase, deploy Railway), `invs-web`
(este repo, deploy Vercel `invs-web.vercel.app`), `invs-backoffice`
(admin, sin deployar todavía), `invs-mobile-mvp-fixed` (Expo).

## Estado general (actualizado 2026-08-19)

- Feature de compra múltiple de entradas: **completo y en producción**,
  ciclo compra→remera→aprobación→compartir→mail con QR→canje en scanner
  verificado end-to-end.
- Hub de streaming + login con Google: **en producción** (API Railway +
  web en Vercel), login Google confirmado funcionando.
- Seguridad/infra: CORS, race conditions y RLS de Supabase ya resueltos
  (RLS habilitado 2026-07-14).

## Pendientes activos (orden de valor)

1. Dominio propio para mails transaccionales (Resend en modo prueba solo
   entrega a `walterarce@gmail.com`, bloquea invitar a otras personas).
2. Publicar la app de Google (hoy solo test users) + página de política
   de privacidad.
3. Login con Google en mobile (`expo-auth-session`, sin probar — puede
   necesitar ajuste de redirect URI).
4. Deployar `invs-backoffice` (sigue sin deployar, iría a Vercel).
5. ⚠️ Crédito de Railway por agotarse — pasar a plan Hobby (USD 5/mes)
   antes de que se caiga el backend.
6. Rotar password de Supabase (quedó expuesta en una sesión anterior).
7. Menores: sección "vivos comprables" en el Hub de streaming (hoy solo
   se compra desde el detalle de cada evento), Openpay Argentina sin
   cuenta creada todavía, `MUX_SIGNING_KEY` sin configurar en dev local.

## Reglas al tocar este repo

- No hay lint ni tests configurados — el único chequeo es
  `tsc --noEmit` / `npm run build` antes de dar algo por terminado.
- Antes de cambios grandes, correr `git status` — puede haber trabajo
  sin commitear de otra sesión (Claude Code u opencode) sin mezclar.
- Migraciones nuevas de Prisma en `invs-backend`: acordarse de habilitar
  RLS en las tablas nuevas (se olvidó una vez).

## Convención de este archivo

Cuando termines algo relevante para la otra herramienta (Claude Code u
opencode), anotalo acá arriba en "Pendientes activos" o "Estado
general" antes de cortar. No hace falta detalle exhaustivo — con que la
otra punta sepa qué cambió y qué sigue alcanza.
