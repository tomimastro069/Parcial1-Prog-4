import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  useProductos,
  useCreateProducto,
  useUpdateProducto,
  useDeleteProducto,
} from '../hooks/useProductos';
import { useCategorias } from '../hooks/useCategorias';
import type { Producto, ProductoCreate, ProductoUpdate } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ProductosPage() {
  const { data: productos, isLoading, isError, error, refetch } = useProductos();
  const { data: categorias } = useCategorias();
  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();
  const deleteMutation = useDeleteProducto();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [formNombre, setFormNombre] = useState('');
  const [formPrecio, setFormPrecio] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formCategoriaId, setFormCategoriaId] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = productos?.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria?.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingProducto(null);
    setFormNombre('');
    setFormPrecio('');
    setFormDescripcion('');
    setFormCategoriaId('');
    setFormErrors({});
    setIsModalOpen(true);
  }

  function openEdit(prod: Producto) {
    setEditingProducto(prod);
    setFormNombre(prod.nombre);
    setFormPrecio(prod.precio.toString());
    setFormDescripcion(prod.descripcion ?? '');
    setFormCategoriaId(prod.categoria_id?.toString() ?? '');
    setFormErrors({});
    setIsModalOpen(true);
  }

  function openDelete(id: number) {
    setDeletingId(id);
    setIsDeleteOpen(true);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!formNombre.trim()) errors.nombre = 'Obligatorio';
    if (!formPrecio.trim() || isNaN(Number(formPrecio)) || Number(formPrecio) <= 0)
      errors.precio = 'Inválido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (editingProducto) {
      const data: ProductoUpdate = {};
      if (formNombre !== editingProducto.nombre) data.nombre = formNombre.trim();
      if (Number(formPrecio) !== editingProducto.precio)
        data.precio = Number(formPrecio);
      if (formDescripcion !== (editingProducto.descripcion ?? ''))
        data.descripcion = formDescripcion.trim() || null;
      const newCatId = formCategoriaId ? Number(formCategoriaId) : null;
      if (newCatId !== editingProducto.categoria_id)
        data.categoria_id = newCatId;
      await updateMutation.mutateAsync({ id: editingProducto.id, data });
    } else {
      const data: ProductoCreate = {
        nombre: formNombre.trim(),
        precio: Number(formPrecio),
        descripcion: formDescripcion.trim() || null,
        categoria_id: formCategoriaId ? Number(formCategoriaId) : null,
      };
      await createMutation.mutateAsync(data);
    }
    setIsModalOpen(false);
  }

  async function handleDelete() {
    if (deletingId === null) return;
    await deleteMutation.mutateAsync(deletingId);
    setIsDeleteOpen(false);
    setDeletingId(null);
  }

  if (isLoading) return <LoadingSpinner text="Cargando repositorio..." />;
  if (isError) return <ErrorMessage message="Error logístico" onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Artículos finales para comercializar.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors w-full sm:w-auto"
          >
            <PlusIcon className="w-4 h-4" />
            Vincular Nuevo
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Término o categoría de producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-md placeholder:text-gray-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Datos Base
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asociación
                </th>
                <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered && filtered.length > 0 ? (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{prod.nombre}</div>
                      <div className="text-xs text-gray-500 mt-1">ID: {prod.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-700">
                        ${prod.precio.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {prod.categoria ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {prod.categoria.nombre}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No clasificado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/productos/${prod.id}`}
                          className="text-gray-400 hover:text-slate-900 transition-colors"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <button onClick={() => openEdit(prod)} className="text-slate-600 hover:text-slate-900 transition-colors">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDelete(prod.id)} className="text-red-500 hover:text-red-700 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    Data no encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProducto ? 'Formulario de Ajuste' : 'Dar de Alta'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={formNombre} onChange={(e) => setFormNombre(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo Registrado</label>
              <input type="number" step="0.01" value={formPrecio} onChange={(e) => setFormPrecio(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría asignada</label>
            <select value={formCategoriaId} onChange={(e) => setFormCategoriaId(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500">
              <option value="">Seleccionar una categoría (Opcional)</option>
              {categorias?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detalle Informativo</label>
            <textarea value={formDescripcion} onChange={(e) => setFormDescripcion(e.target.value)} rows={3} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
             <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium rounded-md transition-colors">Cancelar</button>
             <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 rounded-md disabled:opacity-50">Guardar Cambios</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Desechar Data" message="Confirme para dar de baja permanentemente esta tupla de la BD." isLoading={deleteMutation.isPending} />
    </div>
  );
}
