import { useMemo } from "react";
import type { ResultRow } from "../../../types/ProductionSchedule";

interface IResumoCliente {
  client_name: string;
  quantity: number;
  revenue: number;
}

const pieces = (row: ResultRow) => row.production ?? row.demand ?? 0;

function Resumo({ dados }: { dados: ResultRow[] }) {
  const linhas = useMemo(() => dados.filter((row) => row.kind !== "stop"), [dados]);

  const total = useMemo(
    () =>
      linhas.reduce(
        (acc, curr) => {
          acc.quantity += pieces(curr);
          acc.revenue_total += curr.expected_revenue;
          return acc;
        },
        { quantity: 0, revenue_total: 0 },
      ),
    [linhas],
  );

  const aggregateData = useMemo(() => {
    const porCliente = new Map<string, IResumoCliente>();
    for (const row of linhas) {
      const atual = porCliente.get(row.client_name) ?? {
        client_name: row.client_name,
        quantity: 0,
        revenue: 0,
      };
      atual.quantity += pieces(row);
      atual.revenue += row.expected_revenue;
      porCliente.set(row.client_name, atual);
    }
    return porCliente;
  }, [linhas]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full relative overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium text-blue-600 mb-4">Resumo Geral</h2>

        <div className="overflow-y-auto h-[130px]">
          <table className="w-full">
            <thead className="bg-white sticky z-10 top-0">
              <tr className="text-xs text-gray-500 border-b border-gray-200">
                <th className="text-left pb-2 font-medium">Clientes</th>
                <th className="text-center pb-2 font-medium">Volume de Pc</th>
                <th className="text-center pb-2 font-medium">Faturamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from(aggregateData.values()).map((item, idx) => (
                <tr key={idx} className="text-sm">
                  <td className="py-2 text-gray-900">{item.client_name}</td>
                  <td className="py-2 text-gray-700 text-center">
                    {Intl.NumberFormat("pt-br").format(item.quantity)}
                  </td>
                  <td className="py-2 text-gray-700  text-center">
                    {Intl.NumberFormat("pt-br", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="border-t-2 border-gray-300 flex justify-between">
          <span className="py-2 text-gray-900">Total: </span>
          <span className="py-2 text-gray-900 text-sm font-medium">
            {Intl.NumberFormat("pt-br").format(total.quantity)}
          </span>
          <span className="py-2 text-gray-900 text-sm font-medium pr-2">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(total.revenue_total)}
          </span>
        </footer>
      </div>
    </div>
  );
}

export default Resumo;
