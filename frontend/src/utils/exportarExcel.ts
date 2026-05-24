import * as XLSX from 'xlsx';

type Fila = Record<string, string | number | boolean | null | undefined>;

export function descargarExcel(filas: Fila[], nombreHoja: string, nombreArchivo: string) {
  const ws = XLSX.utils.json_to_sheet(filas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
}

export function descargarExcelMultiHoja(
  hojas: { nombre: string; filas: Fila[] }[],
  nombreArchivo: string
) {
  const wb = XLSX.utils.book_new();
  for (const { nombre, filas } of hojas) {
    const ws = XLSX.utils.json_to_sheet(filas.length > 0 ? filas : [{}]);
    XLSX.utils.book_append_sheet(wb, ws, nombre);
  }
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
}
