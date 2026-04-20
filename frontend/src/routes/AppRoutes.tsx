import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import CategoriasPage from '../pages/CategoriasPage';
import IngredientesPage from '../pages/IngredientesPage';
import ProductosPage from '../pages/ProductosPage';
import ProductoDetallePage from '../pages/ProductoDetallePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'categorias', element: <CategoriasPage /> },
      { path: 'ingredientes', element: <IngredientesPage /> },
      { path: 'productos', element: <ProductosPage /> },
      { path: 'productos/:id', element: <ProductoDetallePage /> },
    ],
  },
]);
