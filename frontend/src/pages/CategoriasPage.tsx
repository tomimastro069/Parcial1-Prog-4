import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  useCategorias,
  useCreateCategoria,
  useUpdateCategoria,
  useDeleteCategoria,
} from '../hooks/useCategorias';
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function CategoriasPage() {
  const { data: categorias, isLoading, isError, error, refetch } = useCategorias();
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();
  const deleteMutation = useDeleteCategoria();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = categorias?.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingCategoria(null);
    setFormNombre('');
    setFormDescripcion('');
    setFormErrors({});
    setIsModalOpen(true);
  }

  function openEdit(cat: Categoria) {
    setEditingCategoria(cat);
    setFormNombre(cat.nombre);
    setFormDescripcion(cat.descripcion ?? '');
    setFormErrors({});
    setIsModalOpen(true);
  }

  function openDelete(id: number) {
    setDeletingId(id);
    setIsDeleteOpen(true);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!formNombre.trim()) errors.nombre = 'El nombre es obligatorio';
    else if (formNombre.trim().length < 2)
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (editingCategoria) {
      const data: CategoriaUpdate = {};
      if (formNombre !== editingCategoria.nombre) data.nombre = formNombre.trim();
      if (formDescripcion !== (editingCategoria.descripcion ?? ''))
        data.descripcion = formDescripcion.trim() || null;
      await updateMutation.mutateAsync({ id: editingCategoria.id, data });
    } else {
      const data: CategoriaCreate = {
        nombre: formNombre.trim(),
        descripcion: formDescripcion.trim() || null,
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

  // Reset mutations on modal close
  useEffect(() => {
    if (!isModalOpen) {
      createMutation.reset();
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  if (isLoading) return <LoadingSpinner text="Cargando categorías..." />;
  if (isError)
    return (
      <ErrorMessage
        message={
          (error as { response?: { data?: { detail?: string } } })?.response
            ?.data?.detail ?? 'No se pudieron cargar las categorías'
        }
        onRetry={refetch}
      />
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra las categorías de tus productos.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-colors w-full sm:w-auto"
          >
            <PlusIcon className="w-4 h-4" />
            Nueva Categoría
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-md placeholder:text-gray-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered && filtered.length > 0 ? (
                filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cat.nombre}</div>
                      <div className="text-xs text-gray-500">ID: {cat.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {cat.descripcion ? cat.descripcion : <span className="italic text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(cat)}
                          className="text-slate-600 hover:text-slate-900 transition-colors"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDelete(cat.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    {search ? 'Sin coincidencias.' : 'Aún no hay registros.'}
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
        title={editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
              className={`w-full px-3 py-2 bg-white border text-gray-900 text-sm rounded-md focus:outline-none focus:ring-1 transition-colors ${
                formErrors.nombre
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-slate-500 focus:ring-slate-500'
              }`}
              autoFocus
            />
            {formErrors.nombre && (
              <p className="mt-1 text-xs text-red-500">{formErrors.nombre}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formDescripcion}
              onChange={(e) => setFormDescripcion(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Cerrar y Guardar
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar eliminación"
        message="¿Estás seguro de que querés eliminar el registro? Si hay relación con otros datos en la BD podría fallar."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
