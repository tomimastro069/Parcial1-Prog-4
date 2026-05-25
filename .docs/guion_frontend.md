# 🎬 Guión Frontend — Parcial 2

**Duración objetivo:** 4–5 minutos  
**Personas:** 2 (Persona C y Persona D)  
**Formato:** Clips cortos de ~1 min cada uno, luego se juntan  

> **Regla de oro:** No leer código línea por línea. Abrís el archivo, señalás lo importante y explicás el CONCEPTO. Cuando toca mostrar la UI, grabá la pantalla del navegador directamente.

---

## 🎤 Persona C — Módulo Store + Carrito (~2:30 min)

### Clip 1 — Estructura del proyecto y Axios (≈1 min)

**Qué mostrar en pantalla:**
1. Sidebar del editor mostrando la estructura: `src/api/`, `src/store/`, `src/hooks/`, `src/features/`, `src/routes/`, `src/types/`, `src/pages/`, `src/components/`
2. [axiosClient.ts](file:///home/cristian/repos_utn/Parcial1-Prog-4/frontend/src/api/axiosClient.ts) — instancia con interceptors
3. [client.ts](file:///home/cristian/repos_utn/Parcial1-Prog-4/frontend/src/api/client.ts) — instancia pública

**Qué decir:**

> "Nuestro frontend está hecho con React, TypeScript y Vite. La estructura se organiza por feature: tenemos `api/` para la comunicación con el backend, `store/` para el estado global con Zustand, `hooks/` para los custom hooks de TanStack Query, `features/` para los componentes de cada módulo, y `pages/` para las pantallas."
>
> *(Abrir axiosClient.ts)*
>
> "Tenemos dos instancias de Axios. Esta es la principal — `axiosClient` — que tiene `withCredentials: true` para enviar las cookies HttpOnly. El **interceptor de request** inyecta el Bearer token leyéndolo de localStorage. Y el **interceptor de response** maneja los 401: si el token expiró, limpia la sesión y redirige al login automáticamente."
>
> *(Abrir client.ts brevemente)*
>
> "Y esta otra — `apiClient` — es para las llamadas públicas al catálogo, con interceptors de logging que nos sirven para debuggear en la consola."

---

### Clip 2 — Carrito con Zustand + persist (≈1 min)

**Qué mostrar en pantalla:**
1. [cartStore.ts](file:///home/cristian/repos_utn/Parcial1-Prog-4/frontend/src/store/cartStore.ts) — store del carrito
2. Abrir DevTools del navegador → Application → Local Storage → mostrar la key `foodstore-cart`
3. [CartDrawer.tsx](file:///home/cristian/repos_utn/Parcial1-Prog-4/frontend/src/features/store/CartDrawer.tsx) — componente visual (mostrar brevemente en el navegador)

**Qué decir:**

> "El carrito usa Zustand con el middleware `persist`. Eso significa que el estado se serializa automáticamente en localStorage bajo la key `foodstore-cart`. Si el usuario cierra el navegador y vuelve, el carrito sigue ahí."
>
> *(Señalar las funciones en el store)*
>
> "Tenemos `addItem` que verifica si el producto ya existe para sumar la cantidad, `removeItem`, `updateCantidad`, y getters derivados como `subtotal()` y `total()` que incluyen el costo de envío. El costo de envío se obtiene del backend con `fetchCostoEnvio`."
>
> *(Cambiar al navegador, mostrar el drawer abierto y el localStorage en DevTools)*
>
> "Acá lo ven funcionando: agrego un producto, se actualiza el drawer, y en localStorage pueden ver el JSON serializado con los items."

---

### Clip 3 — Checkout y creación de pedido (≈30 seg)

**Qué mostrar en pantalla:**
1. [CheckoutPage.tsx](file:///home/cristian/repos_utn/Parcial1-Prog-4/frontend/src/pages/store/CheckoutPage.tsx) — el formulario de checkout
2. Navegador mostrando la pantalla de checkout con productos

**Qué decir:**

> "La pantalla de Checkout consume tres endpoints con `useQuery`: mis direcciones, las formas de pago habilitadas, y los items vienen del store de Zustand. Al confirmar, usamos `useMutation` con `createPedido`: si sale bien, limpia el carrito y redirige a Mis Pedidos. Si falla, muestra el error que devuelve el backend con un toast."

---

## 🎤 Persona D — Módulo Admin + Rutas + TanStack Query (~2:30 min)

### Clip 4 — Rutas y protección por rol (≈1 min)

**Qué mostrar en pantalla:**
1. [AppRoutes.tsx](file:///home/cristian/repos_utn/Parcial1-Prog-4/frontend/src/routes/AppRoutes.tsx) — configuración de rutas
2. [ProtectedRoute.tsx](file:///home/cristian/repos_utn/Parcial1-Prog-4/frontend/src/features/auth/ProtectedRoute.tsx) — componente de protección
3. [authStore.ts](file:///home/cristian/repos_utn/Parcial1-Prog-4/frontend/src/store/authStore.ts) — store de autenticación (mostrar `hasRole`)

**Qué decir:**

> "Usamos `react-router-dom` con `createBrowserRouter`. Las rutas están organizadas en tres bloques: públicas — login y register —, rutas de cliente — store, detalle de producto con parámetro `:id` dinámico, checkout y mis pedidos —, y rutas de admin protegidas por roles."
>
> *(Señalar la línea de ProtectedRoute en las rutas de admin)*
>
> "Las rutas de admin pasan `requiredRoles={['ADMIN', 'STOCK', 'PEDIDOS']}`. El componente `ProtectedRoute` verifica dos cosas: primero si el usuario está autenticado — si no, redirige al login — y después si tiene alguno de los roles requeridos — si no, manda a la pantalla 403."
>
> *(Abrir ProtectedRoute.tsx brevemente)*
>
> "Es un componente muy simple: lee `isAuthenticated` y `hasRole` del store de Zustand, valida, y renderiza `<Outlet />` si pasa ambas condiciones."

---

### Clip 5 — TanStack Query: useQuery + useMutation + invalidación (≈1 min)

**Qué mostrar en pantalla:**
1. [useCategorias.ts](file:///home/cristian/repos_utn/Parcial1-Prog-4/frontend/src/hooks/useCategorias.ts) — hook con useQuery y useMutation
2. [GestorPedidosPage.tsx](file:///home/cristian/repos_utn/Parcial1-Prog-4/frontend/src/pages/admin/GestorPedidosPage.tsx) — ejemplo inline de useQuery + useMutation

**Qué decir:**

> "Para el server state usamos TanStack Query. Acá en `useCategorias` ven el patrón que repetimos en todos los módulos:"
>
> "El `useQuery` hace el fetch del listado con una query key que incluye los parámetros de paginación y búsqueda. Esto le permite a React Query cachear por página."
>
> "Las mutaciones — crear, editar, eliminar — usan `useMutation`, y lo clave es el `onSuccess`: ahí hacemos `invalidateQueries({ queryKey: ['categorias'] })`. Eso le dice a TanStack Query que la caché está desactualizada y necesita hacer un re-fetch automático. No tenemos que manejar re-renders manualmente."
>
> *(Cambiar a GestorPedidosPage.tsx, señalar la mutación de actualizar estado)*
>
> "Lo mismo en el gestor de pedidos: el `useMutation` de actualizar estado invalida la query `todosPedidos` al completarse, y la tabla se actualiza sola."

---

### Clip 6 — Tipado y estructura de componentes (≈30 seg)

**Qué mostrar en pantalla:**
1. [types/index.ts](file:///home/cristian/repos_utn/Parcial1-Prog-4/frontend/src/types/index.ts) — interfaces TypeScript
2. [ProductoCard.tsx](file:///home/cristian/repos_utn/Parcial1-Prog-4/frontend/src/features/store/ProductoCard.tsx) — componente con Props tipadas

**Qué decir:**

> "Todo el proyecto está tipado con TypeScript. En `types/index.ts` definimos las interfaces centralizadas: `Producto`, `Categoria`, `CartItem`, `PaginatedResponse` genérica, etc. Cada respuesta del backend tiene su interface."
>
> *(Cambiar a ProductoCard.tsx)*
>
> "Un ejemplo concreto: `ProductoCard` recibe sus Props tipadas con la interface `ProductoCardProps` que contiene un `Producto`. El componente es presentacional: recibe datos, renderiza la card, y usa el store para agregar al carrito. Nada de lógica de negocio adentro."

---

## 📋 Checklist antes de grabar

| ✅ | Qué preparar |
|---|---|
| ☐ | Frontend corriendo (`npm run dev`) y backend levantado |
| ☐ | Usuario CLIENT logueado para mostrar el store y carrito |
| ☐ | Usuario ADMIN logueado (otra ventana/incógnito) para mostrar el panel admin |
| ☐ | Tener productos cargados en el carrito para las capturas |
| ☐ | DevTools del navegador abierto en Application → Local Storage |
| ☐ | Fuente del editor a tamaño 16+ para que se lea bien |
| ☐ | Pedidos en distintos estados para mostrar el gestor de pedidos |

## 🗂️ Resumen de archivos por clip

| Clip | Persona | Archivos / Pantallas |
|---|---|---|
| 1 | C | Sidebar, `axiosClient.ts`, `client.ts` |
| 2 | C | `cartStore.ts`, DevTools localStorage, `CartDrawer.tsx` (navegador) |
| 3 | C | `CheckoutPage.tsx`, navegador con checkout |
| 4 | D | `AppRoutes.tsx`, `ProtectedRoute.tsx`, `authStore.ts` |
| 5 | D | `useCategorias.ts`, `GestorPedidosPage.tsx` |
| 6 | D | `types/index.ts`, `ProductoCard.tsx` |
