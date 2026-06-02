import { useEffect, useRef, useState } from 'react';
import Modal from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { useCreateProducto, useUpdateProducto } from '../../../hooks/useProductos';
import { useCategorias, useCreateCategoria } from '../../../hooks/useCategorias';
import { useIngredientes, useCreateIngrediente } from '../../../hooks/useIngredientes';
import { useUnidades } from '../../../hooks/useUnidades';
import { uploadImagen, deleteImagen } from '../../../api/imagenesApi';
import type { ProductoRead, ProductoIngredienteInput } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editando: ProductoRead | null;
}

export function ProductoModal({ isOpen, onClose, editando }: Props) {
  const crear = useCreateProducto();
  const actualizar = useUpdateProducto();
  const crearCategoria = useCreateCategoria();
  const crearIngrediente = useCreateIngrediente();
  const { data: catData } = useCategorias({ size: 1000 });
  const { data: ingData, isLoading: loadingIngredientes } = useIngredientes({ size: 1000 });
  const { data: unidades = [] } = useUnidades();
  const categorias: { id: number; nombre: string }[] = (catData as any)?.items ?? [];
  const ingredientes: { id: number; nombre: string; unidad?: string; es_alergeno: boolean }[] = (ingData as any)?.items ?? [];

  const [nombre, setNombre] = useState('');
  const [precioBase, setPrecioBase] = useState(''); // solo para productos terminados
  const [descripcion, setDescripcion] = useState('');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<number[]>([]);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<ProductoIngredienteInput[]>([]);
  const [esTerminado, setEsTerminado] = useState(false);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [imagenPublicId, setImagenPublicId] = useState<string | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ nombre?: string; precio?: string; ingredientes?: string }>({});
  const [busquedaCategoria, setBusquedaCategoria] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [busquedaIngrediente, setBusquedaIngrediente] = useState('');
  const [cantidadesRaw, setCantidadesRaw] = useState<Record<number, string>>({});

  // Mini-form nueva categoría
  const [creandoCategoria, setCreandoCategoria] = useState(false);

  // Mini-form nuevo ingrediente
  const [creandoIngrediente, setCreandoIngrediente] = useState(false);
  const [nuevoIngUnidad, setNuevoIngUnidad] = useState<number | ''>('');

  const ingredientesFiltrados = ingredientes.filter((ing) =>
    ing.nombre.toLowerCase().includes(busquedaIngrediente.toLowerCase())
  );

  useEffect(() => {
    if (editando) {
      setNombre(editando.nombre);
      setPrecioBase(''); // el precio base real no viene en el read, viene calculado
      setDescripcion(editando.descripcion ?? '');
      setCategoriasSeleccionadas(editando.categorias.map((c) => c.id));
      setIngredientesSeleccionados(
        editando.ingredientes.map((i) => ({ ingrediente_id: i.id, cantidad: i.cantidad }))
      );
      setEsTerminado(editando.es_terminado);
      setImagenUrl(editando.imagen_url ?? null);
      setImagenPublicId(null); // el public_id no se guarda en BD, solo se usa al subir
    } else {
      setNombre('');
      setPrecioBase('');
      setImagenUrl(null);
      setImagenPublicId(null);
      setDescripcion('');
      setCategoriasSeleccionadas([]);
      setIngredientesSeleccionados([]);
      setEsTerminado(false);
    }
    setErrors({});
    setBusquedaCategoria('');
    setBusquedaIngrediente('');
    setCantidadesRaw({});
    setCreandoCategoria(false);
    setCreandoIngrediente(false);
    setNuevoIngUnidad('');
  }, [editando, isOpen]);

  const validate = () => {
    const e: { nombre?: string; precio?: string; ingredientes?: string } = {};
    if (!nombre.trim() || nombre.length < 2) e.nombre = 'Mínimo 2 caracteres';

    if (esTerminado) {
      const p = parseFloat(precioBase);
      if (!precioBase || isNaN(p) || p <= 0) e.precio = 'El costo base debe ser mayor a 0';
    } else if (ingredientesSeleccionados.length === 0) {
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
      return [...prev, { ingrediente_id: id, cantidad: 0 }];
    });
    setBusquedaIngrediente('');
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
      precio_base: esTerminado && precioBase ? parseFloat(precioBase) : undefined,
      descripcion: descripcion.trim() || null,
      es_terminado: esTerminado,
      categorias: categoriasSeleccionadas,
      ingredientes: esTerminado ? [] : ingredientesSeleccionados,
      imagen_url: imagenUrl ?? undefined,
    };

    if (editando) {
      await actualizar.mutateAsync({ id: editando.id, data });
    } else {
      await crear.mutateAsync(data);
    }
    onClose();
  };

  const isPending = crear.isPending || actualizar.isPending;

  const handleImagenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoImagen(true);
    try {
      const resultado = await uploadImagen(file);
      setImagenUrl(resultado.url);
      setImagenPublicId(resultado.public_id);
    } catch {
      alert('Error al subir la imagen. Verificá que el backend esté corriendo con cloudinary instalado.');
    } finally {
      setSubiendoImagen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEliminarImagen = async () => {
    if (imagenPublicId) {
      try { await deleteImagen(imagenPublicId); } catch { /* si falla el delete en cloudinary igual limpiamos */ }
    }
    setImagenUrl(null);
    setImagenPublicId(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editando ? 'Editar producto' : 'Nuevo producto'}
      size="lg"
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

        {/* Precio — solo para terminados */}
        {esTerminado && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Costo base <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(el precio de venta se calcula con el índice de ganancia)</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={precioBase}
              onChange={(e) => setPrecioBase(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none"
            />
            {errors.precio && <p className="mt-1 text-xs text-red-600">{errors.precio}</p>}
          </div>
        )}

        {/* Para productos elaborados: info de precio calculado */}
        {!esTerminado && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
            💡 El precio de venta se calcula automáticamente: <strong>suma del costo de ingredientes × índice de ganancia</strong>. Configurá el precio unitario de cada ingrediente desde la pestaña Ingredientes.
          </div>
        )}

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
        {categorias && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Categorías
            </label>

            {/* Categorías seleccionadas */}
            {categoriasSeleccionadas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {categoriasSeleccionadas.map((id) => {
                  const cat = categorias.find((c) => c.id === id);
                  if (!cat) return null;
                  return (
                    <span
                      key={cat.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2E75B6]/10 text-[#2E75B6] border border-[#2E75B6]/20 transition-all hover:bg-[#2E75B6]/15"
                    >
                      {cat.nombre}
                      <button
                        type="button"
                        onClick={() => toggleCategoria(cat.id)}
                        className="p-0.5 rounded-full hover:bg-[#2E75B6]/20 text-[#2E75B6]/70 hover:text-[#2E75B6] transition-colors cursor-pointer"
                        title="Quitar categoría"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Buscador de categorías */}
            <div className="relative">
              <input
                type="text"
                placeholder={
                  categoriasSeleccionadas.length === 0
                    ? "Buscar y seleccionar categorías..."
                    : "Buscar más categorías..."
                }
                value={busquedaCategoria}
                onChange={(e) => setBusquedaCategoria(e.target.value)}
                onFocus={() => setMostrarDropdown(true)}
                onBlur={() => setTimeout(() => setMostrarDropdown(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none"
              />

              {mostrarDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {categorias
                    .filter((cat) =>
                      cat.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase()) &&
                      !categoriasSeleccionadas.includes(cat.id)
                    )
                    .map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          toggleCategoria(cat.id);
                          setBusquedaCategoria('');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#2E75B6]/5 hover:text-[#2E75B6] focus:bg-[#2E75B6]/5 focus:outline-none transition-colors border-b last:border-b-0 border-gray-100 font-medium text-gray-700 cursor-pointer"
                      >
                        {cat.nombre}
                      </button>
                    ))}
                  {categorias.filter((cat) =>
                    cat.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase()) &&
                    !categoriasSeleccionadas.includes(cat.id)
                  ).length === 0 && (
                      <p className="text-xs text-gray-400 py-3 text-center">
                        {categorias.length === 0
                          ? "No hay categorías registradas"
                          : "No se encontraron categorías disponibles"}
                      </p>
                    )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ingredientes */}
        <div className={esTerminado ? 'opacity-40 pointer-events-none' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ingredientes {!esTerminado && <span className="text-red-500">*</span>}
          </label>

          {/* SECCIÓN 1: Ingredientes ya seleccionados con sus cantidades */}
          {ingredientesSeleccionados.length > 0 && (
            <div className="mb-3 border border-[#2E75B6]/20 rounded-lg bg-[#2E75B6]/5 p-2 space-y-1.5">
              {ingredientesSeleccionados.map((sel) => {
                const ing = ingredientes.find(i => i.id === sel.ingrediente_id);
                if (!ing) return null;
                return (
                  <div key={sel.ingrediente_id} className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 border border-[#2E75B6]/20">
                    <span className="flex-1 text-xs font-medium text-[#2E75B6]">
                      {ing.nombre}
                      {ing.unidad && <span className="text-gray-400 ml-1">({ing.unidad})</span>}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="ej: 0.180"
                      value={cantidadesRaw[ing.id] ?? (sel.cantidad === 0 ? '' : String(sel.cantidad))}
                      onChange={(e) => {
                        const raw = e.target.value.replace(',', '.');
                        if (raw === '' || /^[0-9]*\.?[0-9]*$/.test(raw)) {
                          setCantidadesRaw(prev => ({ ...prev, [ing.id]: raw }));
                          const num = parseFloat(raw);
                          if (!isNaN(num)) setCantidad(ing.id, num);
                        }
                      }}
                      onBlur={(e) => {
                        const raw = e.target.value.replace(',', '.');
                        const v = parseFloat(raw);
                        if (!v || v <= 0) {
                          setCantidad(ing.id, 1);
                          setCantidadesRaw(prev => ({ ...prev, [ing.id]: '1' }));
                        }
                      }}
                      className="w-24 rounded border border-gray-300 px-2 py-1 text-xs focus:border-[#2E75B6] focus:outline-none text-center"
                    />
                    <button
                      type="button"
                      onClick={() => toggleIngrediente(ing.id)}
                      className="text-red-400 hover:text-red-600 text-xs px-1.5 py-1 rounded hover:bg-red-50 transition-colors"
                      title="Quitar ingrediente"
                    >✕</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* SECCIÓN 2: Buscador para agregar ingredientes */}
          {!esTerminado && (
            <div>
              <input
                type="text"
                placeholder="Buscar y agregar ingrediente..."
                value={busquedaIngrediente}
                onChange={(e) => setBusquedaIngrediente(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none mb-1"
              />
              {busquedaIngrediente && (
                <div className="border border-gray-200 rounded-lg max-h-36 overflow-y-auto">
                  {loadingIngredientes ? (
                    <p className="text-xs text-gray-400 py-2 text-center">Cargando...</p>
                  ) : ingredientesFiltrados.filter(i => !ingredientesSeleccionados.find(s => s.ingrediente_id === i.id)).length === 0 ? (
                    <p className="text-xs text-gray-400 py-2 text-center">No se encontraron ingredientes</p>
                  ) : (
                    ingredientesFiltrados
                      .filter(i => !ingredientesSeleccionados.find(s => s.ingrediente_id === i.id))
                      .map((ing) => (
                        <button
                          key={ing.id}
                          type="button"
                          onClick={() => toggleIngrediente(ing.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#2E75B6]/5 hover:text-[#2E75B6] border-b last:border-b-0 border-gray-100 transition-colors"
                        >
                          {ing.nombre}
                          {ing.unidad && <span className="text-gray-400 ml-1">({ing.unidad})</span>}
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          )}

          {errors.ingredientes && !esTerminado && (
            <p className="mt-1 text-xs text-red-600">{errors.ingredientes}</p>
          )}
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen del producto</label>
          <div className="flex items-center gap-4">
            {imagenUrl ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                <img src={imagenUrl} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleEliminarImagen}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >✕</button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center shrink-0">
                Sin imagen
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImagenChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendoImagen}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {subiendoImagen ? 'Subiendo...' : imagenUrl ? 'Cambiar imagen' : 'Subir imagen'}
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG o WEBP · Máx 5MB</p>
            </div>
          </div>
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
