// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular?: string | null;
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
  celular?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ─── Categoría ───────────────────────────────────────────────────────────────

export interface CategoriaEnProducto {
  id: number;
  nombre: string;
  full_path?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  parent_id?: number | null;
  is_active: boolean;
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
  unidad_medida_id?: number;
  unidad?: string;
  descripcion: string | null;
  es_alergeno: boolean;
  precio_unitario: number;
  stock_actual: number;
  is_active: boolean;
}

export interface IngredienteCreate {
  nombre: string;
  unidad_medida_id: number;
  descripcion?: string | null;
  es_alergeno?: boolean;
}

export interface IngredienteUpdate {
  nombre?: string;
  unidad_medida_id?: number;
  descripcion?: string | null;
  es_alergeno?: boolean;
}

// ─── Unidad de Medida ────────────────────────────────────────────────────────

export interface UnidadMedida {
  id: number;
  nombre: string;
  simbolo: string;
  tipo: string;
  is_active: boolean;
}

export interface UnidadMedidaCreate {
  nombre: string;
  simbolo: string;
  tipo: string;
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
  precio: number;
  costo?: number;
  margen_ganancia?: number | null;
  descripcion: string | null;
  imagen_url: string | null;
  is_active: boolean;
  es_terminado: boolean;
  categoria?: CategoriaEnProducto | null;
  ingredientes: ProductoIngredienteRead[];
}

export interface ProductoCreate {
  nombre: string;
  precio?: number;
  precio_base?: number;
  margen_ganancia?: number | null;
  descripcion?: string | null;
  imagen_url?: string | null;
  es_terminado?: boolean;
  categoria_id?: number | null;
  ingredientes?: ProductoIngredienteInput[];
}

export interface ProductoUpdate {
  nombre?: string;
  precio?: number;
  precio_base?: number;
  margen_ganancia?: number | null;
  descripcion?: string | null;
  imagen_url?: string | null;
  es_terminado?: boolean;
  categoria_id?: number | null;
  ingredientes?: ProductoIngredienteInput[];
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  is_active: boolean;
  es_terminado: boolean;
  disponible: boolean;
  stock_calculado: number;
  imagen_url?: string | null;
  categoria?: Categoria | null;
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
  stock: number;
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
