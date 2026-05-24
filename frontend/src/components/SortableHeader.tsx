import { ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

interface Props {
  label: string;
  field: string;
  activeField: string | null;
  dir: 'asc' | 'desc';
  onSort: (field: string) => void;
  className?: string;
}

export function SortableHeader({ label, field, activeField, dir, onSort, className = '' }: Props) {
  const isActive = activeField === field;

  return (
    <th
      onClick={() => onSort(field)}
      className={`text-left px-4 py-3 font-semibold text-gray-700 cursor-pointer select-none hover:bg-gray-100 transition-colors ${className}`}
    >
      <span className="flex items-center gap-1">
        {label}
        {isActive ? (
          dir === 'asc' ? (
            <ChevronUpIcon className="w-3.5 h-3.5 text-[#2E75B6]" />
          ) : (
            <ChevronDownIcon className="w-3.5 h-3.5 text-[#2E75B6]" />
          )
        ) : (
          <ChevronUpDownIcon className="w-3.5 h-3.5 text-gray-300" />
        )}
      </span>
    </th>
  );
}
