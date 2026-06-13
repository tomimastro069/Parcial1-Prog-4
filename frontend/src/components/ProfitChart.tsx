import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getTodosPedidos } from '../api/pedidosApi';
import { productosApi } from '../api/productosApi';
import { getAjuste } from '../api/ajustesApi';
import type { PedidoResponse } from '../api/pedidosApi';

export function ProfitChart({ projectedIndice }: { projectedIndice?: number }) {
  const [groupBy, setGroupBy] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const { data: pedidosData, isLoading: isLoadingPedidos } = useQuery({
    queryKey: ['todosPedidosAll'],
    queryFn: () => getTodosPedidos(1, 100),
  });

  const { data: productosData, isLoading: isLoadingProductos } = useQuery({
    queryKey: ['todosProductosAll'],
    queryFn: () => productosApi.listAdmin({ size: 100 }),
  });

  const { data: indiceGananciaData, isLoading: isLoadingIndice } = useQuery({
    queryKey: ['ajusteIndiceGananciaAll'],
    queryFn: () => getAjuste('indice_ganancia'),
  });

  const chartData = useMemo(() => {
    if (!pedidosData?.items || !productosData?.items || !indiceGananciaData) return [];

    const savedIndice = parseFloat(indiceGananciaData.valor) || 1;
    const currentIndice = projectedIndice || savedIndice;

    let pedidos = pedidosData.items.filter((p: PedidoResponse) => p.estado_codigo !== 'CANCELADO');

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      pedidos = pedidos.filter(p => new Date(p.created_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      pedidos = pedidos.filter(p => new Date(p.created_at) <= toDate);
    }

    const groupedData: Record<string, { name: string; revenue: number; cost: number; profit: number }> = {};

    pedidos.forEach(pedido => {
      const date = new Date(pedido.created_at);
      let key = '';
      if (groupBy === 'dia') {
        key = date.toLocaleDateString('es-AR');
      } else if (groupBy === 'semana') {
        const firstDay = new Date(date.setDate(date.getDate() - date.getDay() + 1));
        key = `Semana del ${firstDay.toLocaleDateString('es-AR')}`;
      } else {
        key = `${date.toLocaleString('es-AR', { month: 'long' })} ${date.getFullYear()}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = { name: key, revenue: 0, cost: 0, profit: 0 };
      }

      let orderCost = 0;
      let orderRevenue = 0;
      if (pedido.detalles && Array.isArray(pedido.detalles)) {
        pedido.detalles.forEach((detalle: any) => {
          const prod = productosData.items.find((p: any) => p.id === detalle.producto_id);
          if (prod) {
            const productCost = prod.precio / savedIndice;
            const productRevenue = productCost * currentIndice;
            orderCost += productCost * (detalle.cantidad || 1);
            orderRevenue += productRevenue * (detalle.cantidad || 1);
          }
        });
      }

      if (orderCost === 0 && pedido.total > 0) {
        orderCost = pedido.total / savedIndice;
        orderRevenue = orderCost * currentIndice;
      }

      groupedData[key].revenue += orderRevenue;
      groupedData[key].cost += orderCost;
      groupedData[key].profit += (orderRevenue - orderCost);
    });

    return Object.values(groupedData).map(d => ({
      ...d,
      revenue: parseFloat(d.revenue.toFixed(2)),
      cost: parseFloat(d.cost.toFixed(2)),
      profit: parseFloat(d.profit.toFixed(2)),
    }));
  }, [pedidosData, productosData, indiceGananciaData, groupBy, dateFrom, dateTo, projectedIndice]);

  if (isLoadingPedidos || isLoadingProductos || isLoadingIndice) {
    return <div className="p-4 text-center">Cargando gráfico...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Análisis de Ganancias</h2>
          <p className="text-xs text-gray-500">Evolución de ingresos, costos y ganancias</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Desde:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Hasta:</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <select
            value={groupBy}
            onChange={e => setGroupBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="dia">Por Día</option>
            <option value="semana">Por Semana</option>
            <option value="mes">Por Mes</option>
          </select>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No hay datos para mostrar en este rango de fechas.</div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`$${value}`, '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="revenue" name="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="Costos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Ganancia" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}


//libreria utilizada para graficar: recharts
