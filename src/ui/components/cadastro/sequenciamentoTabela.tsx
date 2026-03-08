import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import type { IProductionSchedule } from "../../../types/ProductionSchedule";

const formatDate = (date?: string | null) => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return Intl.DateTimeFormat("pt-br", { timeZone: "UTC" }).format(parsedDate);
};

function SequenciamentoTabela({
  dados,
}: {
  dados: IProductionSchedule["results"];
}) {
  const [busca, setBusca] = useState<string>("");
  const dadosFiltrados = dados.filter(
    (p) =>
      p.client_name.toLowerCase().includes(busca.toLowerCase()) ||
      p.product_name.toLowerCase().includes(busca.toLowerCase()) ||
      (p.machine_name ?? "").toLowerCase().includes(busca.toLowerCase()) ||
      (p.mold_name ?? "").toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="flex-1 rounded-md bg-white shadow p-2">
      <h1 className="text-xl  font-bold">Sequenciamento Planejado</h1>
      <div className="relative w-full mt-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IoSearchSharp className="h-4 w-4 text-gray-400" />
        </div>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          type="text"
          placeholder="Buscar..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="max-h-[280px] mx-auto p-2 overflow-y-auto overflow-x-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[1650px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Clientes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Máquina
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Molde
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Demanda do Produto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Data Limite Faturamento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Data Prevista Finalização da Produção
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Data Prevista de Faturamento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Previsão Faturamento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dadosFiltrados.map((order, index) => (
                <tr
                  key={order.id}
                  className={`${
                    index % 2 === 1 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {order.client_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {order.product_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {order.machine_name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {order.mold_name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {Intl.NumberFormat("pt-br").format(order.quantity)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDate(order.billing_date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDate(order.completion_time)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDate(order.billing_date)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "On Time"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {Intl.NumberFormat("pt-br", {
                      style: "currency",
                      currency: "BRL",
                    }).format(order.expected_revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SequenciamentoTabela;
