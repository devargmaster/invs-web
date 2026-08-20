# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Frontend web (React 19 + TypeScript + Vite) de INVS (Panda Estudios), una
plataforma de eventos con entradas QR, compra múltiple con adicionales,
transferencia de entradas entre usuarios, streaming en vivo (Mux) y venta
de contenido/grabaciones. Es uno de 4 repos hermanos del proyecto
(`invs-backend`, `invs-backoffice`, `invs-mobile-mvp-fixed` viven en el
directorio padre). Apunta a producción por default (API en Railway) y este
repo está deployado en Vercel (`invs-web.vercel.app`).

## Comandos

```bash
npm run dev       # vite, puerto fijo 5174 (server.strictPort en vite.config.ts)
npm run build     # tsc (chequeo de tipos, no emite) && vite build
npm run preview   # sirve el build de dist/
```

No hay lint configurado (sin ESLint/Prettier, sin script `lint`) ni test
runner (sin `.test.tsx`/`.spec.tsx`, sin script `test`) — no asumir
cobertura ni linting automático al hacer cambios. El único chequeo previo
al build es el `tsc` con `strict: true`.

Docker para dev local (corre `npm run dev` dentro del contenedor, con bind
mount del código):
```bash
docker-compose up
```

### Entorno

`src/config/env.ts` centraliza las env vars (`import.meta.env.VITE_*`),
todas con default de producción salvo el token:
- `VITE_API_BASE_URL` — default apunta a
  `https://invsshowsbackend-production.up.railway.app/api/v1`. Para
  desarrollar contra el backend local hay que overridearla en `.env.local`
  (gitignoreado vía `*.local`) con `http://localhost:3000/api/v1`.
- `VITE_GOOGLE_CLIENT_ID` — mismo Client ID que `GOOGLE_CLIENT_ID` en
  `invs-backend`. Sin configurar, `GoogleLoginButton` simplemente no se
  renderiza (no falla).
- `VITE_OPENPAY_PUBLIC_KEY` — sin configurar, el flujo de pago con tarjeta
  muestra un error explícito en vez de fallar en silencio (ver más abajo).

`vercel.json` tiene un rewrite catch-all a `index.html` (SPA), necesario
porque `react-router-dom` maneja rutas del lado del cliente.

## Arquitectura

**Sin librería de estado global ni de data-fetching.** Todo el estado
compartido vive en dos React Context (`AuthContext`, `CheckoutContext`) con
`useState`/`useCallback`/`useMemo` a mano; las llamadas a la API son
`fetch` envuelto en un cliente propio (`src/services/apiClient.ts`), sin
axios ni react-query. No agregar estas libs por costumbre — el patrón
actual es deliberadamente minimalista.

**Capa de servicios por dominio.** Cada archivo en `src/services/`
(`authService`, `eventsService`, `ticketsService`, `ordersService`,
`categoriesService`, `addonsService`, `streamingService`,
`contentPurchasesService`) es un objeto con métodos que llaman a
`apiClient.get/post/patch/delete/postForm` y tipan la respuesta contra
`src/types/*`. Todas las páginas y componentes pasan por esta capa, nunca
hacen `fetch` directo.

**`apiClient.ts` — cliente HTTP a mano.** Guarda el JWT en
`localStorage` (`invs_access_token`), inyecta `Authorization: Bearer` en
cada request, y usa `credentials: 'include'` (para la cookie HttpOnly del
refresh token que emite el backend). Si el body es `FormData` no fuerza
`Content-Type` (lo necesita `postForm`, usado para subir comprobantes de
transferencia). En un 401 fuera de `/login` limpia el token y hace
`window.location.href = '/login'` — un hard redirect, no un `navigate` de
React Router, porque esto corre fuera de un componente.

**Auth: JWT + Google Identity Services, sin SDK de Google.**
`GoogleLoginButton.tsx` carga a mano el script `accounts.google.com/gsi/client`
(con una promesa module-level para no cargarlo dos veces), inicializa
`google.accounts.id` con el Client ID y renderiza el botón oficial. El
`credential` (ID token) que devuelve Google se manda tal cual al backend
(`POST /auth/google`), que lo valida contra el mismo Client ID. El backend
no emite el refresh token por header, sino por cookie; `authService.refresh()`
existe pero `AuthContext` solo hace auto-refresh de sesión al montar
(intenta `getMe()` si hay token en localStorage, no hay refresh automático
por expiración de access token en background).

**`ProtectedRoute` soporta `requiredRole` pero no se usa.** El componente
(`src/components/ProtectedRoute.tsx`) acepta un prop `requiredRole:
'STAFF' | 'ADMIN'`, pero en `App.tsx` la ruta `/staff/scanner` está
envuelta en el `ProtectedRoute` genérico sin pasarlo — el chequeo de rol
para el scanner se hace manualmente adentro de `ScannerPage` (bloquea si
`user.role === 'USER'`). Si se agregan más rutas solo-staff/admin, evaluar
si conviene usar el prop existente en vez de repetir el chequeo a mano.

**Dos flujos de checkout paralelos y no compartidos.** La compra de
entradas a un evento usa `CheckoutContext` (carrito global con categorías +
adicionales, sobrevive entre `CheckoutCategoriesPage` →
`CheckoutAddonsPage` → `CheckoutSummaryPage`) y termina en `ordersService`.
La compra de contenido/streaming (`ContentCheckoutPage`) es un flujo
aparte que no usa `CheckoutContext`: recibe los datos del item vía
`location.state` de React Router (si no hay `state` —p.ej. refresh de
página— redirige a `/streaming`) y pega contra `contentPurchasesService`.
Las páginas de pago con tarjeta/transferencia/confirmación están
duplicadas una vez por flujo (`Checkout*Page` vs `Content*Page`) con la
misma UI y lógica — al tocar una hay que revisar si el cambio aplica
también a la otra.

**Pago con tarjeta: Openpay Argentina (BBVA) sin integrar todavía.**
`src/services/openpayClient.ts` (`tokenizeCard`) es el único lugar
pendiente de completar con el SDK real de Openpay — hoy tira un error
explícito en vez de simular un pago (no hay cuenta de Openpay creada,
confirmado con el usuario). El resto del flujo de pago con tarjeta
(formulario, `ordersService.payCard`, páginas) ya está armado esperando
esa integración. Mientras tanto el flujo de transferencia bancaria
(subida de comprobante + aprobación manual desde el backoffice) es el
único método de pago funcional end-to-end.

**Compartir/transferir entradas.** `ShareTicketModal` pide el email del
destinatario (con doble confirmación) y llama a
`ticketsService.createTransfer`. `IncomingTransferBanner` (montado en
`Layout`, visible en todas las rutas protegidas) hace polling una sola vez
al montar contra `/tickets/transfers/incoming` y muestra un banner
dismisseable si hay transferencias pendientes de aceptar. La aceptación
pasa por `AcceptTransferPage` (ruta pública `/transfers/:token`, fuera del
`ProtectedRoute`), que resuelve tres casos según el estado de sesión: (1)
usuario logueado con el mismo email del destinatario → acepta directo, (2)
logueado con otro email → mensaje pidiendo cambiar de cuenta, (3) no
logueado → si el email destino ya tiene cuenta pide login, si no, formulario
de alta + aceptación en un solo paso
(`registerAndAcceptTransfer`) seguido de un **hard reload** a `/entradas`
(no `navigate`) para que `AuthContext` relea el token recién seteado.

**Scanner QR de staff.** `QRScanner.tsx` usa `html5-qrcode` (no una lib de
React) manejado imperativamente con refs; para evitar doble-scan usa un
ref `hasScanned` (no state, para no re-renderizar a mitad de un scan) y
detiene la cámara apenas decodifica algo. `ScannerPage` valida el QR
contra el backend (`ticketsService.validateQr`) y, si la entrada es
válida, muestra los adicionales de la orden para que el staff los entregue
uno por uno (`redeemAddon`) — un 409 en el redeem se interpreta como "ya
entregado por otro staff en simultáneo" y actualiza el ítem local sin
mostrar error.

**Streaming.** `StreamPlayer.tsx` es agnóstico al proveedor: si
`providerType` es `youtube`/`vimeo` renderiza un `<iframe>` embebido, si es
`mux` (u otro) renderiza un `<video>` nativo con la playback URL firmada
que devuelve el backend. Refleja el mismo patrón de "provider
intercambiable" que usa `invs-backend` para streaming (Mux/YouTube).
