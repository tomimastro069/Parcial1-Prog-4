import { useState, useMemo } from 'react';

type SortDir = 'asc' | 'desc';

export function useSort<T>(items: T[], defaultField?: keyof T) {
  const [field, setField] = useState<keyof T | null>(defaultField ?? null);
  const [dir, setDir] = useState<SortDir>('asc');

  const toggle = (f: keyof T) => {
    if (field === f) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setField(f);
      setDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!field) return items;
    return [...items].sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), 'es', { sensitivity: 'base' });
      return dir === 'asc' ? cmp : -cmp;
    });
  }, [items, field, dir]);

  return { sorted, field, dir, toggle };
}
