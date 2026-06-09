import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import AdminLayout from '../pages/admin/AdminLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import LandingPageVerdadera from '../pages/LandingPageVerdadera';
import MenuPublicoPage from '../pages/MenuPublicoPage';
import StorePage from '../pages/store/StorePage';
import StoreLayout from '../pages/store/StoreLayout';
import ProductoDetallePage from '../pages/store/ProductoDetallePage';
import DashboardPage from '../pages/admin/DashboardPage';
import IngredientesAdminPage from '../pages/admin/IngredientesAdminPage';
import CategoriasAdminPage from '../pages/admin/CategoriasAdminPage';
import ProductosAdminPage from '../pages/admin/ProductosAdminPage';
import CheckoutPage from '../pages/store/CheckoutPage';
import MisPedidosPage from '../pages/store/MisPedidosPage';
import GestorPedidosPage from '../pages/admin/GestorPedidosPage';
import GestorUsuariosPage from '../pages/admin/GestorUsuariosPage';
import GestorPagosPage from '../pages/admin/GestorPagosPage';
import PerfilPage from '../pages/store/PerfilPage';
import CheckoutSuccess from '../pages/checkout/CheckoutSuccess';
import CheckoutFailure from '../pages/checkout/CheckoutFailure';
import CheckoutPending from '../pages/checkout/CheckoutPending';

export const router = createBrowserRouter([
  // ─── Rutas públicas ────────────────────────────────────────────────────────
  { path: '/', element: <LandingPageVerdadera /> },
  { path: '/menu', element: <MenuPublicoPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/checkout/success', element: <CheckoutSuccess /> },
  { path: '/checkout/failure', element: <CheckoutFailure /> },
  { path: '/checkout/pending', element: <CheckoutPending /> },

  // ─── Rutas de cliente (rol CLIENT o cualquier autenticado) ─────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/store',
        element: <StoreLayout />,
        children: [
          { index: true, element: <StorePage /> },
          { path: 'producto/:id', element: <ProductoDetallePage /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'mis-pedidos', element: <MisPedidosPage /> },
          { path: 'perfil', element: <PerfilPage /> },
        ],
      },
    ],
  },

  // ─── Rutas de admin ────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute requiredRoles={['ADMIN', 'STOCK', 'PEDIDOS']} redirectTo="/store" />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          // ADMIN → dashboard, STOCK → productos, PEDIDOS → pedidos
          {
            index: true,
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']} redirectTo="/admin/productos">
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            ),
          },
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']} redirectTo="/admin/productos">
                <DashboardPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'productos',
            element: (
              <ProtectedRoute requiredRoles={['ADMIN', 'STOCK']} redirectTo="/admin/pedidos">
                <ProductosAdminPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'ingredientes',
            element: (
              <ProtectedRoute requiredRoles={['ADMIN', 'STOCK']} redirectTo="/admin/pedidos">
                <IngredientesAdminPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'categorias',
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']} redirectTo="/admin/productos">
                <CategoriasAdminPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'pedidos',
            element: (
              <ProtectedRoute requiredRoles={['ADMIN', 'PEDIDOS']} redirectTo="/admin/productos">
                <GestorPedidosPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'usuarios',
            element: (
              <ProtectedRoute requiredRoles={['ADMIN']} redirectTo="/admin/pedidos">
                <GestorUsuariosPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'pagos',
            element: (
              <ProtectedRoute requiredRoles={['ADMIN', 'PEDIDOS']} redirectTo="/admin/productos">
                <GestorPagosPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },

  // ─── Fallback ──────────────────────────────────────────────────────────────
  {
    path: '/unauthorized', element: (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <h1 className="font-baskerville text-5xl font-bold text-coffee mb-2">403</h1>
          <p className="text-clay mb-4">No tenés permisos para acceder a esta página.</p>
          <a href="/store" className="text-walnut hover:underline">Volver al menú</a>
        </div>
      </div>
    )
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
