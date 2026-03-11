import { useQuery } from "@tanstack/react-query";
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
  machine_name: string;
  raw_materials: IProcurementEntry[];
  purchase_items: IProcurementEntry[];
  total_cost: string;
}

interface IProcurementsByJobResponse {
  procurements_by_job: IProcurementsByJobItem[];
}

const formatDate = (value?: string) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return Intl.DateTimeFormat("pt-BR", {
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
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Pedido</th>
            <th className="px-3 py-2 font-medium">Cliente</th>
            <th className="px-3 py-2 font-medium">Produto</th>
            <th className="px-3 py-2 font-medium">Nome Máquina</th>
            {hasMateriaPrima1 && (
              <th className="px-3 py-2 font-medium">
                {materiaPrima1Titulo} (kg)
              </th>
            )}
            {hasMateriaPrima1 && (
              <th className="px-3 py-2 font-medium">
                {`Data compra ${materiaPrima1Titulo}`}
              </th>
            )}
            {hasMateriaPrima1 && (
              <th className="px-3 py-2 font-medium">
                {`Custo compra ${materiaPrima1Titulo}`}
              </th>
            )}
            {hasMateriaPrima2 && (
              <th className="px-3 py-2 font-medium">
                {materiaPrima2Titulo} (kg)
              </th>
            )}
            {hasMateriaPrima2 && (
              <th className="px-3 py-2 font-medium">
                {`Data compra ${materiaPrima2Titulo}`}
              </th>
            )}
            {hasMateriaPrima2 && (
              <th className="px-3 py-2 font-medium">
                {`Custo compra ${materiaPrima2Titulo}`}
              </th>
            )}
            <th className="px-3 py-2 font-medium">Custo Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.key} className="border-t border-gray-200">
              <td className="px-3 py-2">{item.order_number}</td>
              <td className="px-3 py-2">{item.client_name}</td>
              <td className="px-3 py-2">{item.product_name}</td>
              <td className="px-3 py-2">{item.machine_name}</td>
              {hasMateriaPrima1 && (
                <td className="px-3 py-2">
                  {item.materia_prima_1_quantidade !== undefined
                    ? formatToDecimal(
                        item.materia_prima_1_quantidade.toString(),
                      )
                    : ""}
                </td>
              )}
              {hasMateriaPrima1 && (
                <td className="px-3 py-2">{item.materia_prima_1_data}</td>
              )}
              {hasMateriaPrima1 && (
                <td className="px-3 py-2">{item.materia_prima_1_custo}</td>
              )}
              {hasMateriaPrima2 && (
                <td className="px-3 py-2">
                  {item.materia_prima_2_quantidade !== undefined
                    ? formatToDecimal(
                        item.materia_prima_2_quantidade.toString(),
                      )
                    : ""}
                </td>
              )}
              {hasMateriaPrima2 && (
                <td className="px-3 py-2">{item.materia_prima_2_data}</td>
              )}
              {hasMateriaPrima2 && (
                <td className="px-3 py-2">{item.materia_prima_2_custo}</td>
              )}
              <td className="px-3 py-2">{item.total_cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RawMaterialInfoTable({ id }: { id?: number }) {
  if (!id) {
    return <p>Nenhum sequenciamento disponível.</p>;
  }

  return (
    <div>
      <div className="mt-4 w-full overflow-auto max-h-[470px]">
        <RawMaterialTable id={id} />
      </div>
      {/* <div className="mt-4 w-full overflow-auto max-h-[470px]">
        <h1>Teste</h1>
      </div> */}
    </div>
  );
}

export default RawMaterialInfoTable;
