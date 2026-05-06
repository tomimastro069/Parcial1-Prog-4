import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import AdminLayout from '../pages/admin/AdminLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import StorePage from '../pages/store/StorePage';
import ProductoDetallePage from '../pages/store/ProductoDetallePage';
import DashboardPage from '../pages/admin/DashboardPage';
import IngredientesAdminPage from '../pages/admin/IngredientesAdminPage';
import CategoriasAdminPage from '../pages/admin/CategoriasAdminPage';

export const router = createBrowserRouter([
  // ─── Rutas públicas ────────────────────────────────────────────────────────
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // ─── Rutas de cliente (rol CLIENT o cualquier autenticado) ─────────────────
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/store', element: <StorePage /> },
      { path: '/store/producto/:id', element: <ProductoDetallePage /> },
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
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'ingredientes', element: <IngredientesAdminPage /> },
          { path: 'categorias', element: <CategoriasAdminPage /> },
        ],
      },
    ],
  },

  // ─── Fallback ──────────────────────────────────────────────────────────────
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/unauthorized', element: (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
        <p className="text-gray-600 mb-4">No tenés permisos para acceder a esta página.</p>
        <a href="/store" className="text-[#2E75B6] hover:underline">Volver al menú</a>
      </div>
    </div>
  )},
  { path: '*', element: <Navigate to="/login" replace /> },
]);
