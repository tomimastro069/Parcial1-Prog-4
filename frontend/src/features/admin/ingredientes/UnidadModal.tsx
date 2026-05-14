import { useEffect, useState } from 'react';
import Modal from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { useCreateUnidad } from '../../../hooks/useUnidades';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function UnidadModal({ isOpen, onClose }: Props) {
  const crear = useCreateUnidad();

  const [nombre, setNombre] = useState('');
  const [simbolo, setSimbolo] = useState('');
  const [tipo, setTipo] = useState('masa'); // masa, volumen, unidad
  const [errors, setErrors] = useState<{ nombre?: string; simbolo?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setSimbolo('');
      setTipo('masa');
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const e: typeof errors = {};
    if (!nombre.trim() || nombre.length < 2) e.nombre = 'Mínimo 2 caracteres';
    if (!simbolo.trim() || simbolo.length < 1) e.simbolo = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await crear.mutateAsync({
      nombre: nombre.trim(),
      simbolo: simbolo.trim(),
      tipo,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva unidad de medida" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre <span className="text-red-500">*</span></label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:outline-none"
            placeholder="ej. Kilogramo"
          />
          {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Símbolo <span className="text-red-500">*</span></label>
          <input
            value={simbolo}
            onChange={e => setSimbolo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:outline-none"
            placeholder="ej. kg"
          />
          {errors.simbolo && <p className="mt-1 text-xs text-red-600">{errors.simbolo}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo <span className="text-red-500">*</span></label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:outline-none bg-white"
          >
            <option value="masa">Masa</option>
            <option value="volumen">Volumen</option>
            <option value="unidad">Unidad / Cantidad</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={crear.isPending}>Crear unidad</Button>
        </div>
      </form>
    </Modal>
  );
}
