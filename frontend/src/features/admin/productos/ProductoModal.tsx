import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { useCreateProducto, useUpdateProducto } from '../../../hooks/useProductos';
import { useCategorias } from '../../../hooks/useCategorias';
import { useIngredientes } from '../../../hooks/useIngredientes';
import { getAjuste } from '../../../api/ajustesApi';
import { IngredienteModal } from '../ingredientes/IngredienteModal';
import { CategoriaModal } from '../categorias/CategoriaModal';
import { uploadImagen, deleteImagen } from '../../../api/imagenesApi';
import type { ProductoRead, ProductoIngredienteInput, Categoria } from '../../../types';

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

  const [modalIngrediente, setModalIngrediente] = useState(false);
  const [modalCategoria, setModalCategoria] = useState(false);
  const categorias: Categoria[] = (catData as any)?.items ?? [];
  const ingredientes: { id: number; nombre: string; unidad?: string; es_alergeno: boolean; precio_unitario?: number }[] = (ingData as any)?.items ?? [];

  // Margen recomendado: se toma del ajuste del dashboard (índice → %). Es solo
  // una sugerencia para nuevos productos; no afecta precios ya cargados.
  const { data: indiceData } = useQuery({
    queryKey: ['ajusteIndiceGanancia'],
    queryFn: () => getAjuste('indice_ganancia'),
    staleTime: 60_000,
  });
  const MARGEN_RECOMENDADO = indiceData
    ? Math.max(0, Math.round((parseFloat(indiceData.valor) - 1) * 100))
    : 50;
  const MARGEN_MAX = 300; // tope del slider (%)

  const [nombre, setNombre] = useState('');
  const [precioBase, setPrecioBase] = useState(''); // solo para productos terminados
  const [margen, setMargen] = useState(String(MARGEN_RECOMENDADO)); // % de ganancia por producto
  const [descripcion, setDescripcion] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
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
      setPrecioBase(editando.es_terminado ? String(editando.costo ?? '') : ''); // el costo base de terminados
      setMargen(String(editando.margen_ganancia ?? MARGEN_RECOMENDADO));
      setDescripcion(editando.descripcion ?? '');
      setCategoriaSeleccionada(editando.categoria?.id ?? null);
      setIngredientesSeleccionados(
        editando.ingredientes.map((i) => ({ ingrediente_id: i.id, cantidad: i.cantidad }))
      );
      setEsTerminado(editando.es_terminado);
      setImagenUrl(editando.imagen_url ?? null);
      setImagenPublicId(null); // el public_id no se guarda en BD, solo se usa al subir
    } else {
      setNombre('');
      setPrecioBase('');
      setMargen(String(MARGEN_RECOMENDADO));
      setImagenUrl(null);
      setImagenPublicId(null);
      setDescripcion('');
      setCategoriaSeleccionada(null);
      setIngredientesSeleccionados([]);
      setEsTerminado(false);
    }
    setErrors({});
    setBusquedaCategoria('');
    setBusquedaIngrediente('');
    setCantidadesRaw({});
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

  // ── Cálculo de costos y precio de venta (en vivo) ──────────────────────────
  const fmt = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 });

  const margenNum = (() => {
    const m = parseFloat(margen);
    return isNaN(m) || m < 0 ? 0 : m;
  })();

  // Costo de cada ingrediente según la cantidad ingresada
  const lineasIngrediente = ingredientesSeleccionados.map((sel) => {
    const ing = ingredientes.find((i) => i.id === sel.ingrediente_id);
    const precioUnit = ing?.precio_unitario ?? 0;
    return {
      id: sel.ingrediente_id,
      nombre: ing?.nombre ?? '',
      cantidad: sel.cantidad || 0,
      precioUnit,
      subtotal: precioUnit * (sel.cantidad || 0),
    };
  });

  const costoIngredientes = lineasIngrediente.reduce((acc, l) => acc + l.subtotal, 0);
  const costoBase = esTerminado ? parseFloat(precioBase) || 0 : costoIngredientes;
  const precioVenta = costoBase * (1 + margenNum / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      nombre: nombre.trim(),
      precio_base: esTerminado && precioBase ? parseFloat(precioBase) : undefined,
      margen_ganancia: margen === '' ? null : margenNum,
      descripcion: descripcion.trim() || null,
      es_terminado: esTerminado,
      categoria_id: categoriaSeleccionada,
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
    <>
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
              El precio de venta se calcula automáticamente: <strong>costo de ingredientes + margen de ganancia de este producto</strong>. Configurá el precio unitario de cada ingrediente desde la pestaña Ingredientes.
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
              {categoriaSeleccionada && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(() => {
                    const cat = categorias.find((c) => c.id === categoriaSeleccionada);
                    if (!cat) return null;
                    return (
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2E75B6]/10 text-[#2E75B6] border border-[#2E75B6]/20 transition-all hover:bg-[#2E75B6]/15"
                      >
                        {cat.nombre}
                        <button
                          type="button"
                          onClick={() => setCategoriaSeleccionada(null)}
                          className="p-0.5 rounded-full hover:bg-[#2E75B6]/20 text-[#2E75B6]/70 hover:text-[#2E75B6] transition-colors cursor-pointer"
                          title="Quitar categoría"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    );
                  })()}
                </div>
              )}

              {/* Buscador de categorías */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    !categoriaSeleccionada
                      ? "Buscar y seleccionar categoría..."
                      : "Cambiar categoría..."
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
                        categoriaSeleccionada !== cat.id
                      )
                      .map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategoriaSeleccionada(cat.id);
                            setBusquedaCategoria('');
                            setMostrarDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#2E75B6]/5 hover:text-[#2E75B6] focus:bg-[#2E75B6]/5 focus:outline-none transition-colors border-b last:border-b-0 border-gray-100 font-medium text-gray-700 cursor-pointer"
                        >
                          {cat.nombre}
                        </button>
                      ))}

                    {/* Botón crear nueva categoría */}
                    <button
                      type="button"
                      onClick={() => { setModalCategoria(true); setMostrarDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#2E75B6] font-medium hover:bg-[#2E75B6]/5 border-t border-gray-100"
                    >
                      + Nueva categoría
                    </button>
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
                  const precioUnit = ing.precio_unitario ?? 0;
                  const subtotal = precioUnit * (sel.cantidad || 0);
                  return (
                    <div key={sel.ingrediente_id} className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 border border-[#2E75B6]/20">
                      <span className="flex-1 min-w-0 text-xs font-medium text-[#2E75B6]">
                        <span className="block truncate">
                          {ing.nombre}
                          {ing.unidad && <span className="text-gray-400 ml-1">({ing.unidad})</span>}
                        </span>
                        <span className="block text-[10px] font-normal text-gray-400">
                          {fmt(precioUnit)} /{ing.unidad || 'u'} · subtotal <span className="text-gray-600 font-medium">{fmt(subtotal)}</span>
                        </span>
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
                  <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {loadingIngredientes ? (
                      <p className="text-xs text-gray-400 py-2 text-center">Cargando...</p>
                    ) : (
                      <>
                        {ingredientesFiltrados
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
                          ))}

                        {/* Botón crear nuevo ingrediente */}
                        <button
                          type="button"
                          onClick={() => setModalIngrediente(true)}
                          className="w-full text-left px-3 py-2 text-xs text-[#2E75B6] font-medium hover:bg-[#2E75B6]/5 border-t border-gray-100"
                        >
                          + Nuevo ingrediente
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {errors.ingredientes && !esTerminado && (
              <p className="mt-1 text-xs text-red-600">{errors.ingredientes}</p>
            )}
          </div>

          {/* Margen de ganancia por producto + resumen de precios */}
          <div className="rounded-lg border border-[#2E75B6]/20 bg-[#2E75B6]/5 p-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Margen de ganancia de este producto
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-32">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={margen}
                    onChange={(e) => setMargen(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-8 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                </div>
                {margenNum !== MARGEN_RECOMENDADO && (
                  <button
                    type="button"
                    onClick={() => setMargen(String(MARGEN_RECOMENDADO))}
                    className="text-xs font-medium text-[#2E75B6] hover:underline"
                  >
                    Usar recomendado ({MARGEN_RECOMENDADO}%)
                  </button>
                )}
              </div>

              {/* Slider de margen */}
              <div className="relative pt-3">
                <input
                  type="range"
                  min="0"
                  max={MARGEN_MAX}
                  step="1"
                  value={Math.min(margenNum, MARGEN_MAX)}
                  onChange={(e) => setMargen(e.target.value)}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2E75B6] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#2E75B6] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #2E75B6 ${(Math.min(margenNum, MARGEN_MAX) / MARGEN_MAX) * 100}%, #e5e7eb ${(Math.min(margenNum, MARGEN_MAX) / MARGEN_MAX) * 100}%)`,
                  }}
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                  <span>200%</span>
                  <span>{MARGEN_MAX}%</span>
                </div>
              </div>

              <p className="mt-1 text-[11px] text-gray-500">
                Recomendado: <strong>{MARGEN_RECOMENDADO}%</strong> de ganancia sobre el costo
                <span className="text-gray-400"> (definido en el dashboard)</span>.
              </p>
            </div>

            {/* Resumen: costo y precio de venta */}
            <div className="space-y-1 border-t border-[#2E75B6]/15 pt-2.5 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>{esTerminado ? 'Costo base' : 'Costo de ingredientes'}</span>
                <span className="font-medium">{fmt(costoBase)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>Ganancia ({margenNum}%)</span>
                <span>{fmt(precioVenta - costoBase)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-base font-semibold text-[#1F3864]">
                <span>Precio de venta</span>
                <span>{fmt(precioVenta)}</span>
              </div>
            </div>
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

      <IngredienteModal
        isOpen={modalIngrediente}
        onClose={() => setModalIngrediente(false)}
        editando={null}
      />

      <CategoriaModal
        isOpen={modalCategoria}
        onClose={() => setModalCategoria(false)}
        editando={null}
        categorias={categorias}
      />
    </>
  );
}
