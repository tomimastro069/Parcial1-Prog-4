// ─── Categoría ──────────────────────────────────────────────────────────────

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string | null;
}

export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string | null;
}

// ─── Ingrediente ────────────────────────────────────────────────────────────

export interface Ingrediente {
  id: number;
  nombre: string;
  unidad: string;
}

export interface IngredienteCreate {
  nombre: string;
  unidad: string;
}

export interface IngredienteUpdate {
  nombre?: string;
  unidad?: string;
}

// ─── Producto ───────────────────────────────────────────────────────────────

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string | null;
  categoria_id: number | null;
  categoria: Categoria | null;
}

export interface ProductoCreate {
  nombre: string;
  precio: number;
  descripcion?: string | null;
  categoria_id?: number | null;
}

export interface ProductoUpdate {
  nombre?: string;
  precio?: number;
  descripcion?: string | null;
  categoria_id?: number | null;
}

// ─── ProductoIngrediente (tabla intermedia N:N) ─────────────────────────────

export interface ProductoIngrediente {
  producto_id: number;
  ingrediente_id: number;
  cantidad: number;
  ingrediente?: Ingrediente;
}

// ─── Paginación ─────────────────────────────────────────────────────────────

export interface PaginationParams {
  offset?: number;
  limit?: number;
}

// ─── API Error ──────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
}
