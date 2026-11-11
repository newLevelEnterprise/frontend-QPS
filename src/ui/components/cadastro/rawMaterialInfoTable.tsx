import { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";

interface IRunOption {
  data: IProcurementsByJobItem[] | undefined;
  isFetching: boolean;
}

interface IProcurementEntry {
  name: string;
  code?: string | null;
  quantity: number;
  consumption_kg?: number | null;
  stock_available_kg?: number | null;
  purchase_quantity?: number | null;
  purchase_date?: string | null;
  cost?: number | string | null;
  consumption_cost?: number | string | null;
  below_minimum?: boolean;
  cost_missing?: boolean;
  invalid_quantity?: boolean;
}

interface IProcurementsByJobItem {
  job_id: number;
  product_name: string;
  parent_product_code?: string | null;
  parent_product_name?: string | null;
  client_name: string;
  order_number: string;
  machine_name: string;
  composition_missing?: boolean;
  adjusted_demand_missing?: boolean;
  raw_materials: IProcurementEntry[];
  purchase_items: IProcurementEntry[];
  total_cost: string | number;
}

interface IProcurementsByJobResponse {
  procurements_by_job: IProcurementsByJobItem[];
  resumo_total: {
    name: string;
    code?: string | null;
    quantity: number;
    purchase_quantity?: number | null;
    stock_on_hand_kg?: number | null;
    projected_stock_kg?: number | null;
    below_minimum?: boolean;
    total_cost: string | number;
    cost_missing?: boolean;
  }[];
}

interface IRawMaterialSummaryTableProps {
  data: IProcurementsByJobResponse["resumo_total"] | undefined;
  isFetching: boolean;
}

interface IRawMaterialDailyCostChartProps {
  data:
    | {
        id: number;
        purchase_date: string;
        procurement_total: number;
      }[]
    | undefined;
  isFetching: boolean;
}

const formatDate = (value?: string) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const formatCurrency = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "—";
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return String(value);
  return Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parsed);
};

const formatToDecimal = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "—";
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return String(value);
  return Intl.NumberFormat("pt-BR", {
    style: "decimal",
    maximumFractionDigits: 4,
  }).format(parsed);
};

function RawMaterialTable({ data, isFetching }: IRunOption) {
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

  const columnNames: string[] = [];
  data.forEach((job) => {
    job.raw_materials.forEach((material) => {
      if (columnNames.length < 2 && !columnNames.includes(material.name)) {
        columnNames.push(material.name);
      }
    });
  });
  while (columnNames.length < 2) {
    columnNames.push("");
  }

  const materialCell = (
    materials: IProcurementEntry[],
    name: string,
    field: "kg" | "date" | "cost",
  ) => {
    if (!name) return "—";
    const material = materials.find((entry) => entry.name === name);
    if (!material) return "—";
    if (field === "kg") {
      return material.invalid_quantity
        ? "Quantidade inválida"
        : formatToDecimal(material.consumption_kg ?? material.quantity);
    }
    if (field === "date") {
      return formatDate(material.purchase_date || undefined) || "—";
    }
    return material.cost_missing
      ? "Custo não cadastrado"
      : formatCurrency(material.cost);
  };

  const rows = data.map((job) => ({
    key: `job-${job.job_id}-${job.order_number}`,
    order_number: job.order_number,
    client_name: job.client_name,
    parent_code: job.parent_product_code || "—",
    parent_name: job.parent_product_name || job.product_name,
    total_cost: formatCurrency(job.total_cost),
    materials: job.raw_materials,
  }));

  return (
    <div className="relative mx-auto max-h-[470px] overflow-y-auto overflow-x-auto rounded-md border border-gray-200">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
              Pedido
            </th>
            <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
              Cliente
            </th>
            <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
              Código (pai)
            </th>
            <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
              Produto (pai)
            </th>
            {columnNames.map((name, columnIndex) => (
              <Fragment key={`material-column-${columnIndex}`}>
                <th
                  key={`kg-${columnIndex}`}
                  className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap"
                >
                  {name ? `${name} (kg)` : "(kg)"}
                </th>
                <th
                  key={`date-${columnIndex}`}
                  className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap"
                >
                  {name ? `Data compra ${name}` : "Data compra"}
                </th>
                <th
                  key={`cost-${columnIndex}`}
                  className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap"
                >
                  {name ? `Custo compra ${name}` : "Custo compra"}
                </th>
              </Fragment>
            ))}
            <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
              Custo Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((item, index) => (
            <tr
              key={item.key}
              className={`${index % 2 === 1 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition-colors`}
            >
              <td className="px-4 py-3 text-sm text-center text-gray-700">
                {item.order_number}
              </td>
              <td className="px-4 py-3 text-sm text-left text-gray-700">
                {item.client_name}
              </td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">
                {item.parent_code}
              </td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">
                {item.parent_name}
              </td>
              {columnNames.map((name, columnIndex) => (
                <Fragment key={`${item.key}-${columnIndex}`}>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">
                    {materialCell(item.materials, name, "kg")}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">
                    {materialCell(item.materials, name, "date")}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">
                    {materialCell(item.materials, name, "cost")}
                  </td>
                </Fragment>
              ))}
              <td className="px-4 py-3 text-sm text-center text-gray-700">
                {item.total_cost}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RawMaterialSummaryTable({
  data,
  isFetching,
}: IRawMaterialSummaryTableProps) {
  if (isFetching) {
    return <Loader message="Carregando o resumo de matéria prima" />;
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <p className="text-gray-500">Nenhum resumo geral disponível.</p>
      </div>
    );
  }

  const totalCost = data.reduce((acc, item) => {
    const parsed = Number(item.total_cost);
    return Number.isNaN(parsed) ? acc : acc + parsed;
  }, 0);

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium text-center">Descrição</th>
            <th className="px-3 py-2 font-medium text-center">Consumo (kg)</th>
            <th className="px-3 py-2 font-medium text-center">A comprar (kg)</th>
            <th className="px-3 py-2 font-medium text-center">
              Custo da compra
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.name} className="border-t border-gray-200">
              <td className="px-3 py-2 text-center">
                {item.code ? `${item.code} — ${item.name}` : item.name}
              </td>
              <td className="px-3 py-2 text-center">
                {formatToDecimal(item.quantity)}
              </td>
              <td className="px-3 py-2 text-center">
                {formatToDecimal(item.purchase_quantity)}
              </td>
              <td className="px-3 py-2 text-center">
                {item.cost_missing
                  ? "Custo não cadastrado"
                  : formatCurrency(item.total_cost)}
              </td>
            </tr>
          ))}
          <tr className="border-t border-gray-300 bg-gray-50 font-semibold">
            <td className="px-3 py-2 text-center">Total</td>
            <td className="px-3 py-2 text-center"></td>
            <td className="px-3 py-2 text-center"></td>
            <td className="px-3 py-2 text-center">
              {formatCurrency(totalCost.toString())}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function RawMaterialDailyCostChart({
  data,
  isFetching,
}: IRawMaterialDailyCostChartProps) {
  if (isFetching) {
    return <Loader message="Carregando gráfico de matéria prima" />;
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <p className="text-gray-500">Nenhum dado para exibir no gráfico.</p>
      </div>
    );
  }

  const chartData = data
    .sort((a, b) => (a.purchase_date > b.purchase_date ? 1 : -1))
    .map((item) => ({
      day: formatDate(item.purchase_date),
      totalCost: item.procurement_total,
    }));

  if (chartData.length === 0) {
    return (
      <div>
        <p className="text-gray-500">
          Nenhum dado de compra por dia disponível.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-md border border-gray-200 p-4">
      <h2 className="text-[#5A7BEF] font-bold text-lg">
        Custo Total de Matéria-Prima por Dia
      </h2>
      <div className="mt-4 h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 12, left: 44, bottom: 24 }}
          >
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey="day" tickFormatter={(dateValue) => dateValue} />
            <YAxis
              width={90}
              tickMargin={8}
              tickFormatter={(value) =>
                Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                }).format(value)
              }
            />
            <Tooltip
              formatter={(value) =>
                Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(value))
              }
              labelFormatter={(dateValue) => dateValue}
            />
            <Bar
              dataKey="totalCost"
              fill="#255DC8"
              barSize={24}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RawMaterialInfoTable({ id }: { id?: number }) {
  const { data, isFetching } = useQuery({
    queryKey: ["rawMaterialInfo", id],
    queryFn: async () => {
      const { data } = await apiClient.get<IProcurementsByJobResponse>(
        `/production-schedule/${id}/procurements-by-job`,
      );
      return data;
    },
  });

  const { data: forecastData, isFetching: isForecastFetching } = useQuery({
    queryKey: ["procurementsForecast", id],
    queryFn: async () => {
      const { data } = await apiClient.get<
        IRawMaterialDailyCostChartProps["data"]
      >(`/production-schedule/${id}/procurements-forecast`);
      return data;
    },
  });

  if (!id) {
    return <p>Nenhum sequenciamento disponível.</p>;
  }

  return (
    <div className="max-h-[900px] overflow-y-auto">
      <div className="mt-4 w-full">
        <RawMaterialTable
          data={data?.procurements_by_job}
          isFetching={isFetching}
        />
      </div>
      <div className="grid grid-cols-10 gap-4">
        <div className="mt-6 w-full overflow-auto h-full max-h-[470px] col-span-3">
          <div className="p-2 w-full text-center bg-gray-300 border border-gray-200">
            <p className="text-lg font-semibold">Resumo geral</p>
          </div>
          <RawMaterialSummaryTable
            data={data?.resumo_total}
            isFetching={isFetching}
          />
        </div>
        <div className="mt-6 w-full overflow-auto h-full max-h-[470px] col-span-7">
          <RawMaterialDailyCostChart
            data={forecastData}
            isFetching={isForecastFetching}
          />
        </div>
      </div>
    </div>
  );
}

export default RawMaterialInfoTable;
