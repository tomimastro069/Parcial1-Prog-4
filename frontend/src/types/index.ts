// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  roles: string[];
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ─── Categoría ───────────────────────────────────────────────────────────────

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  parent_id?: number | null;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string | null;
  parent_id?: number | null;
}

export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string | null;
  parent_id?: number | null;
}

// ─── Ingrediente ─────────────────────────────────────────────────────────────

export interface Ingrediente {
  id: number;
  nombre: string;
  unidad?: string;
  descripcion: string | null;
  es_alergeno: boolean;
}

export interface IngredienteCreate {
  nombre: string;
  descripcion?: string | null;
  es_alergeno?: boolean;
}

export interface IngredienteUpdate {
  nombre?: string;
  descripcion?: string | null;
  es_alergeno?: boolean;
}

// ─── Producto ────────────────────────────────────────────────────────────────

export interface ProductoIngredienteRead {
  id: number;
  nombre: string;
  unidad: string;
  cantidad: number;
  es_alergeno: boolean;
  descripcion: string | null;
}

export interface ProductoIngredienteInput {
  ingrediente_id: number;
  cantidad: number;
}

export interface ProductoRead {
  id: number;
  nombre: string;
  precio_base: number;
  descripcion: string | null;
  imagen_url: string | null;
  disponible: boolean;
  categorias: { id: number; nombre: string }[];
  ingredientes: ProductoIngredienteRead[];
}

export interface ProductoCreate {
  nombre: string;
  precio: number;
  descripcion?: string | null;
  categorias?: number[];
  ingredientes?: ProductoIngredienteInput[];
}

export interface ProductoUpdate {
  nombre?: string;
  precio?: number;
  descripcion?: string | null;
  categorias?: number[];
  ingredientes?: ProductoIngredienteInput[];
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  is_active: boolean;
  imagen_url?: string | null;
  categorias?: Categoria[];
}

export interface ProductoDetail extends Producto {
  ingredientes: ProductoIngredienteRead[];
}

// ─── Carrito ─────────────────────────────────────────────────────────────────

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url?: string | null;
  personalizacion?: number[];
}

// ─── Paginación ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export interface ConfirmModalData {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

// ─── Error API ───────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
  code?: string;
}
