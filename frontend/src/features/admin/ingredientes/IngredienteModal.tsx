import { useEffect, useState } from 'react';
import Modal from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { useCreateIngrediente, useUpdateIngrediente } from '../../../hooks/useIngredientes';
import { useUnidades } from '../../../hooks/useUnidades';
import type { Ingrediente } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editando: Ingrediente | null;
}

export function IngredienteModal({ isOpen, onClose, editando }: Props) {
  const crear = useCreateIngrediente();
  const actualizar = useUpdateIngrediente();
  const { data: unidades = [], isLoading: cargandoUnidades } = useUnidades();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esAlergeno, setEsAlergeno] = useState(false);
  const [unidadMedidaId, setUnidadMedidaId] = useState<number | ''>('');
  const [errors, setErrors] = useState<{ nombre?: string; unidad?: string }>({});

  useEffect(() => {
    if (editando) {
      setNombre(editando.nombre);
      setDescripcion(editando.descripcion ?? '');
      setEsAlergeno(editando.es_alergeno);
      setUnidadMedidaId(editando.unidad_medida_id ?? '');
    } else {
      setNombre('');
      setDescripcion('');
      setEsAlergeno(false);
      setUnidadMedidaId('');
    }
    setErrors({});
  }, [editando, isOpen]);

  const validate = () => {
    const e: { nombre?: string; unidad?: string } = {};
    if (!nombre.trim() || nombre.length < 2) e.nombre = 'Mínimo 2 caracteres';
    if (!unidadMedidaId) e.unidad = 'Debe seleccionar una unidad';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      es_alergeno: esAlergeno,
      unidad_medida_id: Number(unidadMedidaId),
    };

    if (editando) {
      await actualizar.mutateAsync({ id: editando.id, data });
    } else {
      await crear.mutateAsync(data);
    }
    onClose();
  };

  const isPending = crear.isPending || actualizar.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editando ? 'Editar ingrediente' : 'Nuevo ingrediente'}
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
            Unidad de medida <span className="text-red-500">*</span>
          </label>
          <select
            value={unidadMedidaId}
            onChange={(e) => setUnidadMedidaId(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none bg-white"
            disabled={cargandoUnidades}
          >
            <option value="">Seleccione una unidad</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({u.simbolo})
              </option>
            ))}
          </select>
          {errors.unidad && (
            <p className="mt-1 text-xs text-red-600">{errors.unidad}</p>
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

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={esAlergeno}
              onChange={(e) => setEsAlergeno(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-10 h-6 rounded-full transition-colors ${
                esAlergeno ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  esAlergeno ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            Es alérgeno
          </span>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isPending}>
            {editando ? 'Guardar cambios' : 'Crear ingrediente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
