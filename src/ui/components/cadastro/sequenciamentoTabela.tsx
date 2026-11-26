import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { hiddenModeLabel } from "../../../config/featureFlags";
import type { ResultRow } from "../../../types/ProductionSchedule";

const formatDate = (date?: string | null, hour = false) => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  if (hour) {
    return Intl.DateTimeFormat("pt-br", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(parsedDate);
  }

  return Intl.DateTimeFormat("pt-br", { timeZone: "UTC" }).format(parsedDate);
};

const formatQuantity = (value: number | null) =>
  value === null || value === undefined ? "-" : Intl.NumberFormat("pt-br").format(value);

const th =
  "sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap";

function SequenciamentoTabela({ dados }: { dados: ResultRow[] }) {
  const [busca, setBusca] = useState<string>("");
  const termo = busca.toLowerCase();
  const dadosFiltrados = dados.filter((p) =>
    [p.client_name, p.product_name, p.product_code, p.order_number].some((valor) =>
      (valor ?? "").toLowerCase().includes(termo),
    ),
  );

  return (
    <div className="flex-1 rounded-md bg-white shadow p-2">
      <div className="sticky top-0 z-20 bg-white pb-2 border-b border-gray-100">
        <h1 className="text-xl font-bold">Sequenciamento Planejado</h1>
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
      </div>
      <div className="relative max-h-[300px] mx-auto overflow-y-auto overflow-x-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className={th}>Ordem Seq.</th>
                <th className={th}>Pedido</th>
                <th className={`${th} text-left`}>Cliente</th>
                <th className={th}>Código</th>
                <th className={th}>Produto</th>
                <th className={th}>Demanda</th>
                <th className={th}>Produção</th>
                <th className={th}>Data Limite Faturamento</th>
                <th className={th}>
                  {hiddenModeLabel(
                    "Data de Finalização na Injetora",
                    "Data finalização Maq. Gargalo",
                  )}
                </th>
                <th className={th}>Data Prevista Final Produção</th>
                <th className={th}>Data Prevista Faturamento</th>
                <th className={th}>Status</th>
                <th className={th}>Valor Faturado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dadosFiltrados.map((order, index) => (
                <tr
                  key={`${order.order}-${order.order_number}`}
                  className={`${
                    index % 2 === 1 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-center">
                    {order.order}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-center">
                    {order.order_number || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-left whitespace-nowrap">
                    {order.client_name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {order.product_code || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-center whitespace-nowrap">
                    {order.product_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {formatQuantity(order.demand)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {formatQuantity(order.production)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {formatDate(order.scheduled_datetime, true)}
                  </td>
                  <td className="px-4 py-3 text-sm  text-gray-900 text-center">
                    {formatDate(order.completion_injection_datetime, true)}
                  </td>
                  <td className="px-4 py-3 text-sm  text-gray-900 text-center">
                    {formatDate(order.completion_datetime, true)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {formatDate(order.billing_date)}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
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
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
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
