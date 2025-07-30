import { useMemo } from "react";
import type {
  IProductionSchedule,
  Results,
} from "../../../types/ProductionSchedule";

function Resumo({ dados }: { dados: IProductionSchedule["results"] }) {
  const total = useMemo(
    () =>
      dados.reduce(
        (acc, curr) => {
          acc.quantity += curr.quantity;
          acc.revenue_total += curr.expected_revenue;

          return acc;
        },
        { quantity: 0, revenue_total: 0 }
      ),
    [dados]
  );

  const aggregateData = useMemo(() => {
    return dados.reduce((acc, curr) => {
      if (!acc.get(curr.client_name)) {
        acc.set(curr.client_name, curr);
        return acc;
      }

      if (acc.get(curr.client_name)) {
        const { quantity, expected_revenue, ...data } = acc.get(
          curr.client_name
        ) as Results;

        const newQuantity = quantity + curr.quantity;
        const newRevenue = expected_revenue + curr.expected_revenue;

        acc.set(curr.client_name, {
          ...data,
          quantity: newQuantity,
          expected_revenue: newRevenue,
        });

        return acc;
      }

      return acc;
    }, new Map<string, Results>());
  }, [dados]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full relative overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium text-blue-600 mb-4">Resumo Geral</h2>

        <div className="overflow-y-auto h-[130px]">
          <table className="w-full">
            <thead className="bg-white sticky z-10 top-0">
              <tr className="text-xs text-gray-500 border-b border-gray-200">
                <th className="text-left pb-2 font-medium">Clientes</th>
                <th className="text-left pb-2 font-medium">Volume de Peças</th>
                <th className="text-left pb-2 font-medium">Faturamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from(aggregateData.values()).map((item) => (
                <tr key={item.job_id} className="text-sm">
                  <td className="py-2 text-gray-900">{item.client_name}</td>
                  <td className="py-2 text-gray-700 text-center">
                    {Intl.NumberFormat("pt-br").format(item.quantity)}
                  </td>
                  <td className="py-2 text-gray-700  text-center">
                    {Intl.NumberFormat("pt-br", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.expected_revenue)}
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
