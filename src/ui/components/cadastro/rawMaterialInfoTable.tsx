import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { IProductionSchedule } from "../../../types/ProductionSchedule";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";

interface IRunOption {
  id: number;
}

interface IProcurementItem {
  id: number;
  run_id: number;
  result_id: number;
  order_index: number;
  job_id: number;
  order_number: string;
  item_type: string;
  item_id: number;
  item_name: string;
  quantity: number;
  purchase_date: string;
  unit_cost: string;
  total_cost: string;
  lead_time_days: number;
  demand_base: number;
  demand_with_scrap: number;
  mold_scrap_percent: number;
  item_scrap_percent: number;
  composition_quantity: number;
  created_at: string;
}

function RawMaterialTable({ id }: IRunOption) {
  const { data, isFetching } = useQuery({
    queryKey: ["rawMaterialInfo", id],
    queryFn: async () => {
      const { data } = await apiClient.get<IProcurementItem[]>(
        `/production-schedule/${id}/procurements`,
      );
      return data;
    },
  });

  if (isFetching) {
    return <Loader message="Carregando a tabela de matéria prima" />;
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <p className="text-gray-500">
          Nenhuma informação de matéria prima disponível para este
          sequenciamento.
        </p>
      </div>
    );
  }

  const formatDate = (value: string) =>
    Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));

  const formatCurrency = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return value;
    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parsed);
  };

  return (
    <div className="w-full overflow-x-auto rounded-md border border-gray-200">
      <table className="min-w-[1000px] w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Pedido</th>
            <th className="px-3 py-2 font-medium">Ordem</th>
            <th className="px-3 py-2 font-medium">Tipo</th>
            <th className="px-3 py-2 font-medium">Item</th>
            <th className="px-3 py-2 font-medium">Quantidade</th>
            <th className="px-3 py-2 font-medium">Data compra</th>
            <th className="px-3 py-2 font-medium">Custo unit.</th>
            <th className="px-3 py-2 font-medium">Custo total</th>
            <th className="px-3 py-2 font-medium">Lead time (dias)</th>
            <th className="px-3 py-2 font-medium">Demanda base</th>
            <th className="px-3 py-2 font-medium">Demanda c/ perda</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t border-gray-200">
              <td className="px-3 py-2">{item.order_number}</td>
              <td className="px-3 py-2">{item.order_index}</td>
              <td className="px-3 py-2">{item.item_type}</td>
              <td className="px-3 py-2">{item.item_name}</td>
              <td className="px-3 py-2">{item.quantity}</td>
              <td className="px-3 py-2">{formatDate(item.purchase_date)}</td>
              <td className="px-3 py-2">{formatCurrency(item.unit_cost)}</td>
              <td className="px-3 py-2">{formatCurrency(item.total_cost)}</td>
              <td className="px-3 py-2">{item.lead_time_days}</td>
              <td className="px-3 py-2">{item.demand_base}</td>
              <td className="px-3 py-2">{item.demand_with_scrap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RawMaterialInfoTable() {
  const [runId, setRunId] = useState<number | null>(null);
  const { data: runs, isFetching } = useQuery({
    queryKey: ["rawMaterialInfo"],
    queryFn: async () => {
      const { data } = await apiClient.get<IProductionSchedule[]>(
        "/production-schedule",
      );
      return data.map((s) => ({ startDate: s.created_at, id: s.id }));
    },
  });

  if (isFetching) {
    return <Loader message="Carregando a página" />;
  }

  return (
    <div>
      <h2>Filtre pelo sequenciamento do dia</h2>
      <select
        value={runId ?? undefined}
        onChange={(e) => setRunId(Number(e.target.value))}
        className="p-2 border rounded-md w-full max-w-sm"
      >
        {runs?.map((run) => (
          <option key={run.id} value={run.id}>
            {Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(run.startDate))}
          </option>
        ))}
      </select>

      <div className="mt-4">
        {runId ? <RawMaterialTable id={runId} /> : null}
      </div>
    </div>
  );
}

export default RawMaterialInfoTable;
