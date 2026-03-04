import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { IProductionSchedule } from "../../../types/ProductionSchedule";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";

interface IRunOption {
  id: number;
}

interface IProcurementEntry {
  name: string;
  quantity: number;
  purchase_date: string;
  cost: string;
}

interface IProcurementsByJobItem {
  job_id: number;
  product_name: string;
  client_name: string;
  order_number: string;
  raw_materials: IProcurementEntry[];
  purchase_items: IProcurementEntry[];
  total_cost: string;
}

interface IProcurementsByJobResponse {
  procurements_by_job: IProcurementsByJobItem[];
}

function RawMaterialTable({ id }: IRunOption) {
  const { data, isFetching } = useQuery({
    queryKey: ["rawMaterialInfo", id],
    queryFn: async () => {
      const { data } = await apiClient.get<IProcurementsByJobResponse>(
        `/production-schedule/${id}/procurements-by-job`,
      );
      return data.procurements_by_job;
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

  const rows = data.flatMap((job) => {
    const rawMaterialRows = job.raw_materials.map((entry, index) => ({
      key: `raw-${job.job_id}-${job.order_number}-${index}-${entry.name}`,
      job_id: job.job_id,
      product_name: job.product_name,
      client_name: job.client_name,
      order_number: job.order_number,
      category: "Matéria-prima",
      item_name: entry.name,
      quantity: entry.quantity,
      purchase_date: entry.purchase_date,
      cost: entry.cost,
      total_cost: job.total_cost,
    }));

    const purchaseItemRows = job.purchase_items.map((entry, index) => ({
      key: `purchase-${job.job_id}-${job.order_number}-${index}-${entry.name}`,
      job_id: job.job_id,
      product_name: job.product_name,
      client_name: job.client_name,
      order_number: job.order_number,
      category: "Item de compra",
      item_name: entry.name,
      quantity: entry.quantity,
      purchase_date: entry.purchase_date,
      cost: entry.cost,
      total_cost: job.total_cost,
    }));

    return [...rawMaterialRows, ...purchaseItemRows];
  });

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Job</th>
            <th className="px-3 py-2 font-medium">Pedido</th>
            <th className="px-3 py-2 font-medium">Cliente</th>
            <th className="px-3 py-2 font-medium">Produto</th>
            <th className="px-3 py-2 font-medium">Categoria</th>
            <th className="px-3 py-2 font-medium">Item</th>
            <th className="px-3 py-2 font-medium">Quantidade</th>
            <th className="px-3 py-2 font-medium">Data compra</th>
            <th className="px-3 py-2 font-medium">Custo item</th>
            <th className="px-3 py-2 font-medium">Total pedido</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.key} className="border-t border-gray-200">
              <td className="px-3 py-2">{item.job_id}</td>
              <td className="px-3 py-2">{item.order_number}</td>
              <td className="px-3 py-2">{item.client_name}</td>
              <td className="px-3 py-2">{item.product_name}</td>
              <td className="px-3 py-2">{item.category}</td>
              <td className="px-3 py-2">{item.item_name}</td>
              <td className="px-3 py-2">{item.quantity}</td>
              <td className="px-3 py-2">{formatDate(item.purchase_date)}</td>
              <td className="px-3 py-2">{formatCurrency(item.cost)}</td>
              <td className="px-3 py-2">{formatCurrency(item.total_cost)}</td>
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

      <div className="mt-4 w-full overflow-auto max-h-[470px]">
        {runId ? <RawMaterialTable id={runId} /> : null}
      </div>
    </div>
  );
}

export default RawMaterialInfoTable;
