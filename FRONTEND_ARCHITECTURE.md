# TRABIX Frontend — Arquitectura y Plan de Implementación

## 1. Resumen del Sistema

TRABIX es un sistema de distribución de producto con jerarquía de vendedores. El backend (NestJS + Prisma + PostgreSQL + Redis) ya está completo. Este documento define la arquitectura del frontend.

**Usuarios objetivo:**
- **Admin** — Dashboard web de escritorio. Gestión completa del negocio.
- **Vendedor/Reclutador** — Interfaz mobile-first. Registro de ventas, seguimiento de lotes, notificaciones.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Framework | **Next.js 14+ (App Router)** | SSR para SEO no es prioridad, pero el App Router da layouts anidados perfectos para admin vs vendedor |
| Lenguaje | **TypeScript** | Tipado compartido con el backend |
| Estilos | **Tailwind CSS** | Minimalista, utility-first, responsive nativo |
| Componentes UI | **shadcn/ui** | Componentes accesibles, sin vendor lock-in, personalizable |
| Estado servidor | **TanStack Query (React Query)** | Cache, refetch, optimistic updates |
| Estado cliente | **Zustand** | Ligero, para auth state y UI state |
| Formularios | **React Hook Form + Zod** | Validación que espeja los DTOs del backend |
| HTTP Client | **Axios** | Interceptors para auth, refresh token automático |
| WebSocket | **Socket.IO Client** | Compatible con el gateway del backend |
| Tablas | **TanStack Table** | Para las tablas paginadas del admin |
| Gráficas | **Recharts** | Ligero, para dashboard |
| Iconos | **Lucide React** | Consistente con shadcn/ui |

---

## 3. Estructura de Carpetas

```
trabix-frontend/
├── public/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Grupo: páginas sin layout principal
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── cambiar-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx            # Layout limpio (sin sidebar)
│   │   │
│   │   ├── (admin)/                  # Grupo: panel admin
│   │   │   ├── layout.tsx            # Sidebar + header admin
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── usuarios/
│   │   │   │   ├── page.tsx          # Lista
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # Detalle
│   │   │   │   ├── crear/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── eliminados/
│   │   │   │       └── page.tsx
│   │   │   ├── lotes/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── crear/
│   │   │   │       └── page.tsx
│   │   │   ├── ventas/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── ventas-mayor/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── registrar/
│   │   │   │       └── page.tsx
│   │   │   ├── cuadres/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── cuadres-mayor/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── mini-cuadres/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── stock/
│   │   │   │   ├── page.tsx          # Vista stock + déficit + reservado
│   │   │   │   └── pedidos/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── [id]/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── crear/
│   │   │   │           └── page.tsx
│   │   │   ├── equipamiento/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── fondo-recompensas/
│   │   │   │   └── page.tsx
│   │   │   ├── configuraciones/
│   │   │   │   └── page.tsx
│   │   │   └── notificaciones/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (vendedor)/               # Grupo: panel vendedor (mobile-first)
│   │   │   ├── layout.tsx            # Bottom nav + header simple
│   │   │   ├── inicio/
│   │   │   │   └── page.tsx          # Home del vendedor
│   │   │   ├── vender/
│   │   │   │   └── page.tsx          # Registrar venta (flujo rápido)
│   │   │   ├── mis-lotes/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── solicitar/
│   │   │   │       └── page.tsx
│   │   │   ├── mis-ventas/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── mis-cuadres/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── equipamiento/
│   │   │   │   └── page.tsx
│   │   │   ├── mi-equipo/            # Solo reclutadores
│   │   │   │   └── page.tsx
│   │   │   ├── perfil/
│   │   │   │   └── page.tsx
│   │   │   └── notificaciones/
│   │   │       └── page.tsx
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Redirect según rol
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui (button, input, dialog, etc.)
│   │   ├── layout/
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── admin-header.tsx
│   │   │   ├── vendedor-bottom-nav.tsx
│   │   │   ├── vendedor-header.tsx
│   │   │   └── notification-bell.tsx
│   │   ├── shared/
│   │   │   ├── data-table.tsx        # Tabla reutilizable con TanStack Table
│   │   │   ├── pagination.tsx
│   │   │   ├── estado-badge.tsx      # Badge de estados (colores por estado)
│   │   │   ├── money-display.tsx     # Formato moneda COP
│   │   │   ├── confirm-dialog.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── loading-skeleton.tsx
│   │   │   └── error-boundary.tsx
│   │   ├── forms/
│   │   │   ├── login-form.tsx
│   │   │   ├── crear-usuario-form.tsx
│   │   │   ├── crear-lote-form.tsx
│   │   │   ├── registrar-venta-form.tsx
│   │   │   ├── registrar-venta-mayor-form.tsx
│   │   │   ├── confirmar-cuadre-form.tsx
│   │   │   └── pedido-stock-form.tsx
│   │   └── modules/
│   │       ├── dashboard/
│   │       │   ├── resumen-cards.tsx
│   │       │   ├── ventas-chart.tsx
│   │       │   └── cuadres-pendientes-list.tsx
│   │       ├── lotes/
│   │       │   ├── lote-card.tsx
│   │       │   ├── tanda-progress.tsx
│   │       │   └── resumen-financiero.tsx
│   │       ├── ventas/
│   │       │   ├── venta-detail-card.tsx
│   │       │   └── detalle-venta-table.tsx
│   │       ├── cuadres/
│   │       │   └── cuadre-detail-card.tsx
│   │       ├── stock/
│   │       │   ├── stock-overview.tsx
│   │       │   └── deficit-alert.tsx
│   │       └── notificaciones/
│   │           ├── notification-list.tsx
│   │           └── notification-item.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts             # Axios instance con interceptors
│   │   │   ├── auth.api.ts
│   │   │   ├── usuarios.api.ts
│   │   │   ├── lotes.api.ts
│   │   │   ├── tandas.api.ts
│   │   │   ├── ventas.api.ts
│   │   │   ├── ventas-mayor.api.ts
│   │   │   ├── cuadres.api.ts
│   │   │   ├── cuadres-mayor.api.ts
│   │   │   ├── mini-cuadres.api.ts
│   │   │   ├── equipamiento.api.ts
│   │   │   ├── stock.api.ts
│   │   │   ├── fondo.api.ts
│   │   │   ├── configuraciones.api.ts
│   │   │   └── notificaciones.api.ts
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-usuarios.ts
│   │   │   ├── use-lotes.ts
│   │   │   ├── use-ventas.ts
│   │   │   ├── use-cuadres.ts
│   │   │   ├── use-stock.ts
│   │   │   ├── use-equipamiento.ts
│   │   │   ├── use-fondo.ts
│   │   │   ├── use-notificaciones.ts
│   │   │   └── use-websocket.ts
│   │   ├── store/
│   │   │   ├── auth.store.ts         # Zustand: user, tokens, login/logout
│   │   │   └── ui.store.ts           # Zustand: sidebar open, theme
│   │   ├── validators/
│   │   │   ├── auth.schema.ts        # Zod schemas que espejan los DTOs
│   │   │   ├── usuario.schema.ts
│   │   │   ├── lote.schema.ts
│   │   │   ├── venta.schema.ts
│   │   │   └── equipamiento.schema.ts
│   │   ├── utils/
│   │   │   ├── format.ts             # Moneda, fechas, porcentajes
│   │   │   ├── constants.ts          # Enums, estados, colores
│   │   │   └── cn.ts                 # className merger (shadcn)
│   │   └── websocket/
│   │       └── socket.ts             # Socket.IO client singleton
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── usuario.types.ts
│   │   ├── lote.types.ts
│   │   ├── tanda.types.ts
│   │   ├── venta.types.ts
│   │   ├── venta-mayor.types.ts
│   │   ├── cuadre.types.ts
│   │   ├── cuadre-mayor.types.ts
│   │   ├── mini-cuadre.types.ts
│   │   ├── equipamiento.types.ts
│   │   ├── stock.types.ts
│   │   ├── fondo.types.ts
│   │   ├── configuracion.types.ts
│   │   ├── notificacion.types.ts
│   │   ├── api.types.ts              # PaginatedResponse, ApiError, etc.
│   │   └── enums.ts                  # Todos los enums del backend
│   │
│   └── proxy.ts                 # Auth redirect middleware
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Mapa Completo de Endpoints → Pantallas

### 4.1 Auth (`/auth`)

| Método | Endpoint | Pantalla Frontend | Rol |
|--------|----------|-------------------|-----|
| POST | `/auth/login` | `/login` | Público |
| POST | `/auth/refresh` | Automático (interceptor Axios) | — |
| POST | `/auth/logout` | Botón en header/perfil | Todos |
| POST | `/auth/cambiar-password` | `/cambiar-password` o modal en perfil | Todos |
| POST | `/auth/admin/reset-password/:id` | Botón en detalle usuario | Admin |
| POST | `/auth/admin/desbloquear/:id` | Botón en detalle usuario | Admin |

### 4.2 Dashboard Admin (`/admin/dashboard`)

| Método | Endpoint | Componente | Datos |
|--------|----------|-----------|-------|
| GET | `/admin/dashboard/resumen` | `resumen-cards.tsx` | ventasHoy, ingresosHoy, stockFisico, cuadresPendientes, vendedoresActivos, saldoFondo |
| GET | `/admin/dashboard/ventas-periodo?periodo=dia\|semana\|mes` | `ventas-chart.tsx` | totalVentas, totalIngresos, trabixVendidos |
| GET | `/admin/dashboard/vendedores-activos` | Card en dashboard | total, vendedores, reclutadores |
| GET | `/admin/dashboard/cuadres-pendientes` | `cuadres-pendientes-list.tsx` | Lista con acción rápida |

### 4.3 Usuarios (`/usuarios`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| POST | `/usuarios` | `/admin/usuarios/crear` | Admin |
| GET | `/usuarios` | `/admin/usuarios` (tabla) | Admin |
| GET | `/usuarios/eliminados` | `/admin/usuarios/eliminados` | Admin |
| GET | `/usuarios/me` | `/vendedor/perfil` | Todos |
| GET | `/usuarios/me/jerarquia` | `/vendedor/mi-equipo` | Reclutador |
| GET | `/usuarios/:id` | `/admin/usuarios/[id]` | Admin |
| PATCH | `/usuarios/:id` | Modal edición en detalle | Admin |
| PATCH | `/usuarios/:id/estado` | Toggle en detalle | Admin |
| DELETE | `/usuarios/:id` | Botón en detalle | Admin |
| POST | `/usuarios/:id/restaurar` | Botón en lista eliminados | Admin |
| GET | `/usuarios/:id/jerarquia` | Árbol en detalle usuario | Admin |

### 4.4 Lotes (`/lotes`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| POST | `/lotes` | `/admin/lotes/crear` | Admin |
| GET | `/lotes` | `/admin/lotes` (tabla) | Admin |
| POST | `/lotes/solicitar` | `/vendedor/mis-lotes/solicitar` | Vendedor/Reclutador |
| GET | `/lotes/info-solicitud` | Pre-carga en solicitar | Vendedor/Reclutador |
| GET | `/lotes/mis-lotes` | `/vendedor/mis-lotes` | Vendedor/Reclutador |
| GET | `/lotes/:id` | `/admin/lotes/[id]` o `/vendedor/mis-lotes/[id]` | Todos |
| POST | `/lotes/:id/activar` | Botón en detalle lote | Admin |
| POST | `/lotes/:id/cancelar` | Botón en detalle lote | Todos |
| GET | `/lotes/:id/resumen-financiero` | Sección en detalle lote | Todos |

### 4.5 Tandas (`/tandas`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| GET | `/tandas/lote/:loteId` | Lista dentro del detalle de lote | Todos |
| GET | `/tandas/:id` | Expandible dentro del lote | Todos |
| POST | `/tandas/:id/confirmar-entrega` | Botón en tanda | Admin |

### 4.6 Ventas (`/ventas`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| POST | `/ventas` | `/vendedor/vender` (formulario rápido) | Vendedor/Reclutador |
| GET | `/ventas` | `/admin/ventas` o `/vendedor/mis-ventas` | Todos |
| GET | `/ventas/:id` | Detalle venta | Todos |
| POST | `/ventas/:id/aprobar` | Botón en detalle | Admin |
| POST | `/ventas/:id/rechazar` | Botón en detalle | Admin |

### 4.7 Ventas Mayor (`/ventas-mayor`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| POST | `/ventas-mayor` | `/admin/ventas-mayor/registrar` | Admin |
| GET | `/ventas-mayor` | `/admin/ventas-mayor` (tabla) | Admin |
| GET | `/ventas-mayor/calcular-stock` | Pre-carga en registrar | Admin |
| GET | `/ventas-mayor/:id` | `/admin/ventas-mayor/[id]` | Admin |
| POST | `/ventas-mayor/:id/completar` | Botón en detalle | Admin |

### 4.8 Cuadres (`/cuadres`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| GET | `/cuadres` | `/admin/cuadres` o `/vendedor/mis-cuadres` | Todos |
| GET | `/cuadres/:id` | Detalle cuadre | Todos |
| POST | `/cuadres/:id/confirmar` | Formulario monto + botón | Admin |

### 4.9 Cuadres Mayor (`/cuadres-mayor`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| GET | `/cuadres-mayor` | `/admin/cuadres-mayor` | Todos |
| GET | `/cuadres-mayor/:id` | Detalle | Todos |
| POST | `/cuadres-mayor/:id/confirmar` | Botón en detalle | Admin |

### 4.10 Mini-Cuadres (`/mini-cuadres`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| GET | `/mini-cuadres/lote/:loteId` | Dentro del detalle de lote | Todos |
| GET | `/mini-cuadres/:id` | Detalle | Todos |
| POST | `/mini-cuadres/:id/confirmar` | Botón en detalle | Admin |

### 4.11 Equipamiento (`/equipamiento`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| POST | `/equipamiento/solicitar` | `/vendedor/equipamiento` (botón solicitar) | Vendedor |
| GET | `/equipamiento/me` | `/vendedor/equipamiento` | Vendedor |
| GET | `/equipamiento` | `/admin/equipamiento` (tabla) | Admin |
| GET | `/equipamiento/:id` | `/admin/equipamiento/[id]` | Admin |
| POST | `/equipamiento/:id/activar` | Botón | Admin |
| POST | `/equipamiento/:id/reportar-dano` | Formulario tipo daño | Admin |
| POST | `/equipamiento/:id/reportar-perdida` | Botón con confirmación | Admin |
| POST | `/equipamiento/:id/devolver` | Botón | Admin |
| POST | `/equipamiento/:id/pagar-mensualidad` | Botón | Admin |
| POST | `/equipamiento/:id/pagar-deuda-dano` | Formulario monto | Admin |
| POST | `/equipamiento/:id/pagar-deuda-perdida` | Formulario monto | Admin |

### 4.12 Stock Admin (`/admin/stock` y `/admin/pedidos-stock`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| GET | `/admin/stock` | `/admin/stock` (overview) | Admin |
| GET | `/admin/stock/deficit` | Alert en stock | Admin |
| GET | `/admin/stock/reservado` | Sección en stock | Admin |
| POST | `/admin/pedidos-stock` | `/admin/stock/pedidos/crear` | Admin |
| GET | `/admin/pedidos-stock` | `/admin/stock/pedidos` (tabla) | Admin |
| GET | `/admin/pedidos-stock/:id` | Detalle pedido | Admin |
| PATCH | `/admin/pedidos-stock/:id` | Edición inline | Admin |
| POST | `/admin/pedidos-stock/:id/costos` | Formulario agregar costo | Admin |
| DELETE | `/admin/pedidos-stock/:id/costos/:costoId` | Botón eliminar | Admin |
| POST | `/admin/pedidos-stock/:id/confirmar` | Botón | Admin |
| POST | `/admin/pedidos-stock/:id/recibir` | Botón | Admin |
| POST | `/admin/pedidos-stock/:id/cancelar` | Botón + motivo | Admin |

### 4.13 Fondo de Recompensas (`/fondo-recompensas`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| GET | `/fondo-recompensas/saldo` | `/admin/fondo-recompensas` | Todos |
| GET | `/fondo-recompensas/transacciones` | Tabla en fondo | Todos |
| POST | `/fondo-recompensas/salida` | Formulario premio | Admin |

### 4.14 Configuraciones (`/admin/configuraciones` y `/admin/tipos-insumo`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| GET | `/admin/configuraciones` | `/admin/configuraciones` | Admin |
| GET | `/admin/configuraciones/categoria/:cat` | Tabs por categoría | Admin |
| PATCH | `/admin/configuraciones/:clave` | Edición inline | Admin |
| GET | `/admin/configuraciones/historial` | Modal/sección historial | Admin |
| CRUD | `/admin/tipos-insumo` | Sección dentro de configuraciones | Admin |

### 4.15 Notificaciones (`/notificaciones`)

| Método | Endpoint | Pantalla | Rol |
|--------|----------|---------|-----|
| GET | `/notificaciones` | `/*/notificaciones` | Todos |
| GET | `/notificaciones/contador` | Badge en campana (header) | Todos |
| PATCH | `/notificaciones/leer-todas` | Botón "Marcar todas leídas" | Todos |
| POST | `/notificaciones/enviar` | Formulario en admin | Admin |
| GET | `/notificaciones/:id` | Detalle (expandible) | Todos |
| PATCH | `/notificaciones/:id/leer` | Al hacer click en notificación | Todos |

---

## 5. Tipos TypeScript (Enums)

```typescript
// types/enums.ts
export enum Rol {
  ADMIN = 'ADMIN',
  VENDEDOR = 'VENDEDOR',
  RECLUTADOR = 'RECLUTADOR',
}

export enum EstadoUsuario { ACTIVO = 'ACTIVO', INACTIVO = 'INACTIVO' }
export enum EstadoLote { CREADO = 'CREADO', ACTIVO = 'ACTIVO', FINALIZADO = 'FINALIZADO' }
export enum ModeloNegocio { MODELO_60_40 = 'MODELO_60_40', MODELO_50_50 = 'MODELO_50_50' }

export enum EstadoTanda {
  INACTIVA = 'INACTIVA', LIBERADA = 'LIBERADA',
  EN_TRANSITO = 'EN_TRANSITO', EN_CASA = 'EN_CASA', FINALIZADA = 'FINALIZADA',
}

export enum EstadoVenta { PENDIENTE = 'PENDIENTE', APROBADA = 'APROBADA', RECHAZADA = 'RECHAZADA' }
export enum TipoVenta { PROMO = 'PROMO', UNIDAD = 'UNIDAD', SIN_LICOR = 'SIN_LICOR', REGALO = 'REGALO' }
export enum EstadoVentaMayor { PENDIENTE = 'PENDIENTE', COMPLETADA = 'COMPLETADA' }
export enum ModalidadVentaMayor { ANTICIPADO = 'ANTICIPADO', CONTRAENTREGA = 'CONTRAENTREGA' }
export enum EstadoCuadre { INACTIVO = 'INACTIVO', PENDIENTE = 'PENDIENTE', EXITOSO = 'EXITOSO' }
export enum ConceptoCuadre { INVERSION_ADMIN = 'INVERSION_ADMIN', GANANCIAS = 'GANANCIAS', MIXTO = 'MIXTO' }
export enum EstadoMiniCuadre { INACTIVO = 'INACTIVO', PENDIENTE = 'PENDIENTE', EXITOSO = 'EXITOSO' }

export enum EstadoEquipamiento {
  SOLICITADO = 'SOLICITADO', ACTIVO = 'ACTIVO',
  DEVUELTO = 'DEVUELTO', PERDIDO = 'PERDIDO',
}

export enum EstadoPedidoStock {
  BORRADOR = 'BORRADOR', CONFIRMADO = 'CONFIRMADO',
  RECIBIDO = 'RECIBIDO', CANCELADO = 'CANCELADO',
}

export enum TipoNotificacion {
  STOCK_BAJO = 'STOCK_BAJO', CUADRE_PENDIENTE = 'CUADRE_PENDIENTE',
  INVERSION_RECUPERADA = 'INVERSION_RECUPERADA', CUADRE_EXITOSO = 'CUADRE_EXITOSO',
  TANDA_LIBERADA = 'TANDA_LIBERADA', MANUAL = 'MANUAL',
  PREMIO_RECIBIDO = 'PREMIO_RECIBIDO', LOTE_ACTIVADO = 'LOTE_ACTIVADO',
  LOTE_FINALIZADO = 'LOTE_FINALIZADO', EQUIPAMIENTO_SOLICITADO = 'EQUIPAMIENTO_SOLICITADO',
  EQUIPAMIENTO_ENTREGADO = 'EQUIPAMIENTO_ENTREGADO', FONDO_EGRESO = 'FONDO_EGRESO',
}
```

---

## 6. Autenticación — Flujo Completo

```
1. Login → POST /auth/login (cédula + password)
   ← { accessToken, refreshToken, expiresIn, user }

2. Guardar en Zustand (auth.store):
   - accessToken → memoria (NO localStorage)
   - refreshToken → httpOnly cookie o localStorage encriptado
   - user → { id, nombre, apellidos, email, rol, requiereCambioPassword }

3. Axios interceptor (request):
   - Adjunta Authorization: Bearer {accessToken}

4. Axios interceptor (response 401):
   - Intenta POST /auth/refresh con refreshToken
   - Si OK → actualiza tokens, reintenta request original
   - Si falla → logout, redirect /login

5. Middleware (proxy) Next.js (proxy.ts):
   - Rutas /admin/* → requiere rol ADMIN
   - Rutas /vendedor/* → requiere VENDEDOR o RECLUTADOR
   - Si requiereCambioPassword → redirige a /cambiar-password

6. WebSocket auth:
   - Al conectar, emit('subscribir', { token: accessToken })
   - Reconectar al refrescar token
```

---

## 7. WebSocket — Integración

```typescript
// lib/websocket/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL + '/ws/notificaciones';

let socket: Socket | null = null;

export function connectSocket(token: string) {
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('nueva-notificacion', (data) => {
    // Actualizar React Query cache de notificaciones
    // Mostrar toast
    // Incrementar contador
  });

  socket.on('stock-actualizado', (data) => { /* Refetch stock */ });
  socket.on('cuadre-pendiente', (data) => { /* Refetch cuadres */ });
  socket.on('tanda-liberada', (data) => { /* Refetch tandas */ });

  return socket;
}
```

---

## 8. Diseño de Pantallas Clave

### 8.1 Login
- Campo cédula (numérico), campo password
- Feedback de error (credenciales, bloqueado, rate limit)
- Responsive: funciona en móvil

### 8.2 Dashboard Admin
- 6 cards: Ventas Hoy, Ingresos, Stock, Cuadres Pendientes, Vendedores Activos, Saldo Fondo
- Gráfica de ventas (toggle día/semana/mes)
- Lista rápida de cuadres pendientes con acción confirmar

### 8.3 Home Vendedor (mobile)
- Card: Stock actual de mi tanda activa (barra de progreso)
- Botón grande "Registrar Venta"
- Últimas ventas (3-5)
- Badge notificaciones
- Card de cuadre pendiente (si hay)

### 8.4 Registrar Venta (mobile)
- Contador por tipo: PROMO (+/-), UNIDAD (+/-), SIN_LICOR (+/-), REGALO (+/-)
- Resumen: total TRABIX, monto estimado
- Botón "Registrar" → POST /ventas
- Feedback inmediato (pendiente de aprobación)

### 8.5 Detalle de Lote
- Info general: vendedor, cantidad, modelo, estado
- Barra de progreso de inversión recuperada
- Lista de tandas con estados visuales (stepper)
- Resumen financiero (inversión, recaudo, ganancias)
- Acciones según estado (activar, cancelar)

---

## 9. Colores de Estados (Design System)

| Estado | Color | Uso |
|--------|-------|-----|
| ACTIVO / APROBADA / EXITOSO / EN_CASA | `green-500` | Éxito |
| PENDIENTE / CREADO / BORRADOR / LIBERADA | `yellow-500` | En espera |
| INACTIVO / INACTIVA | `gray-400` | Deshabilitado |
| RECHAZADA / CANCELADO / PERDIDO | `red-500` | Error/negativo |
| EN_TRANSITO | `blue-500` | En progreso |
| FINALIZADO / COMPLETADA / DEVUELTO | `slate-600` | Terminado |

---

## 10. Formato Moneda

```typescript
// lib/utils/format.ts
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
// formatCOP(120000) → "$120.000"
```

---

## 11. Plan de Implementación (Fases)

### Fase 1 — Fundación (1-2 semanas)
1. Setup Next.js + Tailwind + shadcn/ui
2. Tipos TypeScript (todos los enums + interfaces de response)
3. API client (Axios + interceptors + refresh automático)
4. Auth store (Zustand) + middleware (proxy) de rutas
5. Login + cambiar password
6. Layout admin (sidebar) + layout vendedor (bottom nav)

### Fase 2 — Core Vendedor (1-2 semanas)
1. Home vendedor (resumen de stock, últimas ventas)
2. Registrar venta (formulario rápido)
3. Mis lotes (lista + detalle + solicitar)
4. Mis ventas (lista + detalle)
5. Mis cuadres (lista + detalle)
6. Perfil + equipamiento

### Fase 3 — Core Admin (2-3 semanas)
1. Dashboard (cards + gráfica + cuadres pendientes)
2. Usuarios (CRUD + jerarquía + eliminados)
3. Lotes (lista + detalle + crear + activar)
4. Ventas (lista + aprobar/rechazar)
5. Cuadres (lista + confirmar)
6. Stock (overview + pedidos)

### Fase 4 — Módulos Avanzados (1-2 semanas)
1. Ventas al mayor + cuadres mayor
2. Mini-cuadres
3. Equipamiento admin
4. Fondo de recompensas
5. Configuraciones del sistema

### Fase 5 — Tiempo Real y Polish (1 semana)
1. WebSocket integration (notificaciones push)
2. Notificaciones (lista + badge + marcar leídas)
3. Toasts para eventos real-time
4. Loading states, error handling, empty states
5. PWA setup (para instalación en móvil)

---

## 12. Variables de Entorno Frontend

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TRABIX
```

---

## 13. Decisiones Arquitecturales

| Decisión | Razón |
|----------|-------|
| **App Router** (no Pages) | Layouts anidados permiten separar admin/vendedor limpiamente |
| **Client-side rendering** para datos | Los datos son privados y cambian constantemente, no necesitan SSR |
| **React Query** sobre SWR | Mejor soporte para mutations, optimistic updates, y cache invalidation |
| **Zustand** sobre Context | Más performante, sin re-renders innecesarios, persistencia fácil |
| **shadcn/ui** sobre MUI | Más ligero, sin overhead de CSS-in-JS, ownership total del código |
| **Zod** para validación | Comparte lógica de validación con los DTOs del backend |
| **PWA** en fase 5 | Los vendedores necesitan acceso rápido desde el móvil |
