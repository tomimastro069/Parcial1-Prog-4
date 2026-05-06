import { useEffect, useState } from 'react';
import Modal from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { useCreateCategoria, useUpdateCategoria } from '../../../hooks/useCategorias';
import type { Categoria } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editando: Categoria | null;
  categorias: Categoria[];
}

export function CategoriaModal({ isOpen, onClose, editando, categorias }: Props) {
  const crear = useCreateCategoria();
  const actualizar = useUpdateCategoria();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ nombre?: string }>({});

  useEffect(() => {
    if (editando) {
      setNombre(editando.nombre);
      setDescripcion(editando.descripcion ?? '');
      setParentId(editando.parent_id ?? null);
    } else {
      setNombre('');
      setDescripcion('');
      setParentId(null);
    }
    setErrors({});
  }, [editando, isOpen]);

  const validate = () => {
    const e: { nombre?: string } = {};
    if (!nombre.trim() || nombre.length < 2) e.nombre = 'Mínimo 2 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      parent_id: parentId,
    };

    if (editando) {
      await actualizar.mutateAsync({ id: editando.id, data });
    } else {
      await crear.mutateAsync(data);
    }
    onClose();
  };

  const isPending = crear.isPending || actualizar.isPending;
  const categoriasDisponibles = categorias.filter((c) => c.id !== editando?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editando ? 'Editar categoría' : 'Nueva categoría'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none"
            maxLength={100}
          />
          {errors.nombre && (
            <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Categoría padre (opcional)
          </label>
          <select
            value={parentId ?? ''}
            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none bg-white"
          >
            <option value="">Sin categoría padre</option>
            {categoriasDisponibles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isPending}>
            {editando ? 'Guardar cambios' : 'Crear categoría'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
