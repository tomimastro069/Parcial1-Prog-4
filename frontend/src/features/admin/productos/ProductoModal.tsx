import { useEffect, useState } from 'react';
import Modal from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { useCreateProducto, useUpdateProducto } from '../../../hooks/useProductos';
import { useCategorias } from '../../../hooks/useCategorias';
import { useIngredientes } from '../../../hooks/useIngredientes';
import type { ProductoRead, ProductoIngredienteInput } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editando: ProductoRead | null;
}

export function ProductoModal({ isOpen, onClose, editando }: Props) {
  const crear = useCreateProducto();
  const actualizar = useUpdateProducto();
  const { data: catData } = useCategorias({ size: 1000 });
  const { data: ingData, isLoading: loadingIngredientes } = useIngredientes({ size: 1000 });
  const categorias = (catData as any)?.items ?? [];
  const ingredientes = (ingData as any)?.items ?? [];

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<number[]>([]);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<ProductoIngredienteInput[]>([]);
  const [esTerminado, setEsTerminado] = useState(false);
  const [errors, setErrors] = useState<{ nombre?: string; precio?: string; ingredientes?: string }>({});

  useEffect(() => {
    if (editando) {
      setNombre(editando.nombre);
      setPrecio(String(editando.precio));
      setDescripcion(editando.descripcion ?? '');
      setCategoriasSeleccionadas(editando.categorias.map((c) => c.id));
      setIngredientesSeleccionados(
        editando.ingredientes.map((i) => ({ ingrediente_id: i.id, cantidad: i.cantidad }))
      );
      setEsTerminado(editando.es_terminado);
    } else {
      setNombre('');
      setPrecio('');
      setDescripcion('');
      setCategoriasSeleccionadas([]);
      setIngredientesSeleccionados([]);
      setEsTerminado(false);
    }
    setErrors({});
  }, [editando, isOpen]);

  const validate = () => {
    const e: { nombre?: string; precio?: string; ingredientes?: string } = {};
    if (!nombre.trim() || nombre.length < 2) e.nombre = 'Mínimo 2 caracteres';
    const p = parseFloat(precio);
    if (!precio || isNaN(p) || p <= 0) e.precio = 'Debe ser mayor a 0';

    if (!esTerminado && ingredientesSeleccionados.length === 0) {
      e.ingredientes = 'Debe tener al menos un ingrediente si no es un producto terminado';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleCategoria = (id: number) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleIngrediente = (id: number) => {
    setIngredientesSeleccionados((prev) => {
      if (prev.find((i) => i.ingrediente_id === id)) {
        return prev.filter((i) => i.ingrediente_id !== id);
      }
      return [...prev, { ingrediente_id: id, cantidad: 1 }];
    });
  };

  const setCantidad = (id: number, cantidad: number) => {
    setIngredientesSeleccionados((prev) =>
      prev.map((i) => (i.ingrediente_id === id ? { ...i, cantidad } : i))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      nombre: nombre.trim(),
      precio: parseFloat(precio),
      descripcion: descripcion.trim() || null,
      es_terminado: esTerminado,
      categorias: categoriasSeleccionadas,
      ingredientes: esTerminado ? [] : ingredientesSeleccionados,
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
      title={editando ? 'Editar producto' : 'Nuevo producto'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none"
            maxLength={150}
          />
          {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Precio <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none"
          />
          {errors.precio && <p className="mt-1 text-xs text-red-600">{errors.precio}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none resize-none"
          />
        </div>

        {/* Es Terminado Toggle */}
        <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
          <input
            type="checkbox"
            id="esTerminado"
            checked={esTerminado}
            onChange={(e) => {
              const checked = e.target.checked;
              setEsTerminado(checked);
              if (checked) {
                setIngredientesSeleccionados([]);
              }
            }}
            className="w-4 h-4 text-[#2E75B6] focus:ring-[#2E75B6] border-gray-300 rounded"
          />
          <label htmlFor="esTerminado" className="text-sm font-medium text-[#1F3864] cursor-pointer">
            ¿Es un producto terminado?
            <span className="block text-[10px] text-gray-500 font-normal mt-0.5">
              (No requiere preparación. No se podrán agregar ingredientes)
            </span>
          </label>
        </div>

        {/* Categorías */}
        {categorias && categorias.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Categorías</label>
            <div className="flex flex-wrap gap-2">
              {categorias.map((cat) => {
                const sel = categoriasSeleccionadas.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategoria(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${sel
                      ? 'bg-[#2E75B6] text-white border-[#2E75B6]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#2E75B6]'
                      }`}
                  >
                    {cat.nombre}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Ingredientes */}
        <div className={esTerminado ? 'opacity-40 pointer-events-none' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ingredientes {!esTerminado && <span className="text-red-500">*</span>}
          </label>
          <div className={`max-h-48 overflow-y-auto border rounded-lg p-2 ${errors.ingredientes ? 'border-red-300 bg-red-50/20' : 'border-gray-200'}`}>
            {loadingIngredientes ? (
              <p className="text-xs text-gray-400 py-2 text-center">Cargando ingredientes...</p>
            ) : !ingredientes || ingredientes.length === 0 ? (
              <p className="text-xs text-gray-400 py-2 text-center">
                No hay ingredientes disponibles. Crealos desde la pestaña Ingredientes.
              </p>
            ) : (
              <div className="space-y-1.5">
                {ingredientes.map((ing) => {
                  const sel = ingredientesSeleccionados.find((i) => i.ingrediente_id === ing.id);
                  return (
                    <div key={ing.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleIngrediente(ing.id)}
                        disabled={esTerminado}
                        className={`flex-1 text-left px-2 py-1.5 rounded text-xs font-medium border transition-colors ${sel
                          ? 'bg-[#2E75B6]/10 text-[#2E75B6] border-[#2E75B6]/30'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        {ing.nombre}
                        {ing.unidad && <span className="text-gray-400 ml-1">({ing.unidad})</span>}
                      </button>
                      {sel && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">Cant.</span>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={sel.cantidad}
                            onChange={(e) => setCantidad(ing.id, parseFloat(e.target.value) || 1)}
                            className="w-16 rounded border border-gray-300 px-2 py-1 text-xs focus:border-[#2E75B6] focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {errors.ingredientes && !esTerminado && (
            <p className="mt-1 text-xs text-red-600">{errors.ingredientes}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isPending}>
            {editando ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
