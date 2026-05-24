import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import type { Categoria } from '../../../types';

// ─── Tree builder ────────────────────────────────────────────────────────────

interface TreeNode extends Categoria {
  children: TreeNode[];
}

function buildTree(categorias: Categoria[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];

  categorias.forEach((cat) => map.set(cat.id, { ...cat, children: [] }));

  categorias.forEach((cat) => {
    const node = map.get(cat.id)!;
    if (cat.parent_id != null && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// ─── Nodo del árbol ──────────────────────────────────────────────────────────

interface NodeProps {
  node: TreeNode;
  depth: number;
  isAdmin: boolean;
  onEdit: (cat: Categoria) => void;
  onDelete: (cat: Categoria) => void;
  onActivar: (cat: Categoria) => void;
  onNuevaSub: (parentId: number) => void;
}

function Nodo({ node, depth, isAdmin, onEdit, onDelete, onActivar, onNuevaSub }: NodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const nombreCorto = node.nombre.split(' / ').pop() ?? node.nombre;

  return (
    <div>
      {/* Fila del nodo */}
      <div
        className={`flex items-center gap-2 py-2 pr-3 rounded-lg hover:bg-gray-50 group transition-colors ${
          !node.is_active ? 'opacity-50' : ''
        }`}
        style={{ paddingLeft: `${12 + depth * 28}px` }}
      >
        {/* Botón expandir/colapsar */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`w-5 h-5 flex items-center justify-center rounded text-gray-400 transition-colors ${
            hasChildren ? 'hover:text-gray-700 hover:bg-gray-200' : 'invisible pointer-events-none'
          }`}
        >
          {expanded ? (
            <ChevronDownIcon className="w-3.5 h-3.5" />
          ) : (
            <ChevronRightIcon className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Ícono categoría */}
        <TagIcon
          className={`w-4 h-4 flex-shrink-0 ${
            depth === 0 ? 'text-[#2E75B6]' : 'text-[#4472C4]/60'
          }`}
        />

        {/* Nombre */}
        <span
          className={`flex-1 text-sm ${
            depth === 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
          }`}
        >
          {nombreCorto}
        </span>

        {/* Badge cantidad de hijos */}
        {hasChildren && (
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-medium">
            {node.children.length} sub
          </span>
        )}

        {/* Estado */}
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            node.is_active
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {node.is_active ? 'Activa' : 'Inactiva'}
        </span>

        {/* Acciones (solo admin, aparecen al hover) */}
        {isAdmin && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {node.is_active ? (
              <>
                <button
                  onClick={() => onNuevaSub(node.id)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                  title="Agregar subcategoría"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onEdit(node)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-[#2E75B6] hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(node)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Eliminar"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onActivar(node)}
                className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                title="Reactivar"
              >
                <ArrowPathIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Línea vertical + hijos */}
      {expanded && hasChildren && (
        <div className="relative">
          {/* Línea vertical de conexión */}
          <div
            className="absolute top-0 bottom-0 w-px bg-gray-200"
            style={{ left: `${12 + depth * 28 + 14}px` }}
          />
          {node.children.map((child) => (
            <Nodo
              key={child.id}
              node={child}
              depth={depth + 1}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
              onActivar={onActivar}
              onNuevaSub={onNuevaSub}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Componente público ───────────────────────────────────────────────────────

interface Props {
  categorias: Categoria[];
  isAdmin: boolean;
  onEdit: (cat: Categoria) => void;
  onDelete: (cat: Categoria) => void;
  onActivar: (cat: Categoria) => void;
  onNuevaSub: (parentId: number) => void;
}

export function CategoriaArbol({ categorias, isAdmin, onEdit, onDelete, onActivar, onNuevaSub }: Props) {
  const tree = buildTree(categorias);

  if (tree.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-gray-400">
        No hay categorías todavía. Creá la primera con el botón de arriba.
      </div>
    );
  }

  return (
    <div className="py-2 space-y-0.5">
      {tree.map((node) => (
        <Nodo
          key={node.id}
          node={node}
          depth={0}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          onActivar={onActivar}
          onNuevaSub={onNuevaSub}
        />
      ))}
    </div>
  );
}
