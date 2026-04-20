import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  useIngredientes,
  useCreateIngrediente,
  useUpdateIngrediente,
  useDeleteIngrediente,
} from '../hooks/useIngredientes';
import type {
  Ingrediente,
  IngredienteCreate,
  IngredienteUpdate,
} from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function IngredientesPage() {
  const { data: ingredientes, isLoading, isError, error, refetch } = useIngredientes();
  const createMutation = useCreateIngrediente();
  const updateMutation = useUpdateIngrediente();
  const deleteMutation = useDeleteIngrediente();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingIngrediente, setEditingIngrediente] = useState<Ingrediente | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [formNombre, setFormNombre] = useState('');
  const [formUnidad, setFormUnidad] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = ingredientes?.filter((i) =>
    i.nombre.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingIngrediente(null);
    setFormNombre('');
    setFormUnidad('');
    setFormErrors({});
    setIsModalOpen(true);
  }

  function openEdit(ing: Ingrediente) {
    setEditingIngrediente(ing);
    setFormNombre(ing.nombre);
    setFormUnidad(ing.unidad);
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
    if (!formUnidad.trim()) errors.unidad = 'La unidad es obligatoria';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (editingIngrediente) {
      const data: IngredienteUpdate = {};
      if (formNombre !== editingIngrediente.nombre)
        data.nombre = formNombre.trim();
      if (formUnidad !== editingIngrediente.unidad)
        data.unidad = formUnidad.trim();
      await updateMutation.mutateAsync({ id: editingIngrediente.id, data });
    } else {
      const data: IngredienteCreate = {
        nombre: formNombre.trim(),
        unidad: formUnidad.trim(),
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

  useEffect(() => {
    if (!isModalOpen) {
      createMutation.reset();
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  if (isLoading) return <LoadingSpinner text="Cargando datos..." />;
  if (isError)
    return (
      <ErrorMessage
        message={
          (error as { response?: { data?: { detail?: string } } })?.response
            ?.data?.detail ?? 'No se pudo cargar la base'
        }
        onRetry={refetch}
      />
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingredientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Stock y unidades de medida.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-colors w-full sm:w-auto"
          >
            <PlusIcon className="w-4 h-4" />
            Nuevo Ingrediente
          </button>
        </div>
      </div>

      {/* Search */}
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingrediente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Magnitud (Unidad)
                </th>
                <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered && filtered.length > 0 ? (
                filtered.map((ing) => (
                  <tr key={ing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ing.nombre}</div>
                      <div className="text-xs text-gray-500">REF: #{ing.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {ing.unidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(ing)}
                          className="text-slate-600 hover:text-slate-900 transition-colors"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDelete(ing.id)}
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
                    {search ? 'Nada coincide.' : 'Vacio.'}
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
        title={editingIngrediente ? 'Editar Datos' : 'Registrar'}
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidad (Medida) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formUnidad}
              onChange={(e) => setFormUnidad(e.target.value)}
              className={`w-full px-3 py-2 bg-white border text-gray-900 text-sm rounded-md focus:outline-none focus:ring-1 transition-colors ${
                formErrors.unidad
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-slate-500 focus:ring-slate-500'
              }`}
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
             <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 rounded-md transition-colors disabled:opacity-50"
            >
              Aplicar
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Quitar de Base de Datos"
        message="¿Confirmás borrar esta entidad de tu sistema?"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
