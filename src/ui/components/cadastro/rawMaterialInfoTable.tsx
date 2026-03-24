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
  quantity: number;
  purchase_date: string;
  cost: string;
}

interface IProcurementsByJobItem {
  job_id: number;
  product_name: string;
  client_name: string;
  order_number: string;
  machine_name: string;
  raw_materials: IProcurementEntry[];
  purchase_items: IProcurementEntry[];
  total_cost: string;
}

interface IProcurementsByJobResponse {
  procurements_by_job: IProcurementsByJobItem[];
  resumo_total: {
    name: string;
    quantity: number;
    total_cost: string;
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

const formatCurrency = (value: string) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return value;
  return Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parsed);
};

const formatToDecimal = (value: string) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return value;
  return Intl.NumberFormat("pt-BR", {
    style: "decimal",
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

  const materiaPrima1Titulo = data.find((job) => job.raw_materials[0]?.name)
    ?.raw_materials[0]?.name;
  const materiaPrima2Titulo = data.find((job) => job.raw_materials[1]?.name)
    ?.raw_materials[1]?.name;
  const hasMateriaPrima1 = Boolean(materiaPrima1Titulo);
  const hasMateriaPrima2 = Boolean(materiaPrima2Titulo);

  const rows = data.map((job) => {
    const materiaPrima1 = job.raw_materials[0];
    const materiaPrima2 = job.raw_materials[1];

    return {
      key: `job-${job.job_id}-${job.order_number}`,
      order_number: job.order_number,
      client_name: job.client_name,
      product_name: job.product_name,
      machine_name: job.machine_name,
      materia_prima_1_quantidade: materiaPrima1?.quantity,
      materia_prima_1_data: formatDate(materiaPrima1?.purchase_date),
      materia_prima_1_custo: materiaPrima1
        ? formatCurrency(materiaPrima1.cost)
        : "",
      materia_prima_2_quantidade: materiaPrima2?.quantity,
      materia_prima_2_data: formatDate(materiaPrima2?.purchase_date),
      materia_prima_2_custo: materiaPrima2
        ? formatCurrency(materiaPrima2.cost)
        : "",
      total_cost: formatCurrency(job.total_cost),
    };
  });

  return (
    <div className="relative mx-auto max-h-[470px] overflow-y-auto overflow-x-auto rounded-md border border-gray-200">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
              Pedido
            </th>
            <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
              Cliente
            </th>
            <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
              Produto
            </th>
            <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
              Nome Máquina
            </th>
            {hasMateriaPrima1 && (
              <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                {materiaPrima1Titulo} (kg)
              </th>
            )}
            {hasMateriaPrima1 && (
              <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                {`Data compra ${materiaPrima1Titulo}`}
              </th>
            )}
            {hasMateriaPrima1 && (
              <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                {`Custo compra ${materiaPrima1Titulo}`}
              </th>
            )}
            {hasMateriaPrima2 && (
              <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                {materiaPrima2Titulo} (kg)
              </th>
            )}
            {hasMateriaPrima2 && (
              <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                {`Data compra ${materiaPrima2Titulo}`}
              </th>
            )}
            {hasMateriaPrima2 && (
              <th className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                {`Custo compra ${materiaPrima2Titulo}`}
              </th>
            )}
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
              <td className="px-4 py-3 text-sm text-center text-gray-700">
                {item.client_name}
              </td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">
                {item.product_name}
              </td>
              <td className="px-4 py-3 text-sm text-center text-gray-700">
                {item.machine_name}
              </td>
              {hasMateriaPrima1 && (
                <td className="px-4 py-3 text-sm text-center text-gray-700">
                  {item.materia_prima_1_quantidade !== undefined
                    ? formatToDecimal(
                        item.materia_prima_1_quantidade.toString(),
                      )
                    : ""}
                </td>
              )}
              {hasMateriaPrima1 && (
                <td className="px-4 py-3 text-sm text-center text-gray-700">
                  {item.materia_prima_1_data}
                </td>
              )}
              {hasMateriaPrima1 && (
                <td className="px-4 py-3 text-sm text-center text-gray-700">
                  {item.materia_prima_1_custo}
                </td>
              )}
              {hasMateriaPrima2 && (
                <td className="px-4 py-3 text-sm text-center text-gray-700">
                  {item.materia_prima_2_quantidade !== undefined
                    ? formatToDecimal(
                        item.materia_prima_2_quantidade.toString(),
                      )
                    : ""}
                </td>
              )}
              {hasMateriaPrima2 && (
                <td className="px-4 py-3 text-sm text-center text-gray-700">
                  {item.materia_prima_2_data}
                </td>
              )}
              {hasMateriaPrima2 && (
                <td className="px-4 py-3 text-sm text-center text-gray-700">
                  {item.materia_prima_2_custo}
                </td>
              )}
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
            <th className="px-3 py-2 font-medium text-center">Quantidade</th>
            <th className="px-3 py-2 font-medium text-center">
              Matéria Prima (R$)
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.name} className="border-t border-gray-200">
              <td className="px-3 py-2 text-center">{item.name}</td>
              <td className="px-3 py-2 text-center">
                {formatToDecimal(item.quantity.toString())}
              </td>
              <td className="px-3 py-2 text-center">
                {formatCurrency(item.total_cost)}
              </td>
            </tr>
          ))}
          <tr className="border-t border-gray-300 bg-gray-50 font-semibold">
            <td className="px-3 py-2 text-center">Total</td>
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
        Custo Total de Matéria Prima por Dia
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
