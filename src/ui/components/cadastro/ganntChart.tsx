/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";

interface IRun {
  id: number;
}

interface IGanttBlock {
  job_id: number;
  label: string;
  start: number;
  duration: number;
  end: number;
}

interface IGanttMachine {
  id: number;
  name: string;
  blocks: IGanttBlock[];
}

interface IGanttLine {
  line_id: number;
  total_time: number;
  line_name: string;
  machines: IGanttMachine[];
}

interface IGanttLegendItem {
  index: number;
  pedido: string;
  cliente: string;
  produto: string;
  demanda: string;
  inicio: string;
  finalizacao: string;
}

interface IGanttResponse {
  run_id: number;
  sequencing_start: string;
  lines: IGanttLine[];
  generated_at: string;
  legend: IGanttLegendItem[];
}

const jobColors = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-pink-500",
  "bg-green-600",
  "bg-orange-500",
  "bg-teal-600",
  "bg-fuchsia-600",
  "bg-lime-600",
  "bg-rose-600",
  "bg-purple-700",
  "bg-yellow-600",
  "bg-sky-600",
  "bg-blue-700",
  "bg-emerald-700",
  "bg-orange-700",
  "bg-red-700",
  "bg-pink-700",
  "bg-green-700",
  "bg-cyan-700",
  "bg-indigo-700",
  "bg-violet-700",
  "bg-amber-700",
  "bg-fuchsia-700",
  "bg-lime-700",
  "bg-rose-700",
  "bg-purple-800",
  "bg-yellow-700",
  "bg-sky-700",
  "bg-blue-800",
  "bg-emerald-800",
  "bg-orange-800",
  "bg-red-800",
  "bg-pink-800",
  "bg-green-800",
  "bg-cyan-800",
  "bg-indigo-800",
  "bg-violet-800",
  "bg-amber-800",
  "bg-fuchsia-800",
  "bg-lime-800",
  "bg-rose-800",
];

const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatMinutes = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
};

const formatTimelineTime = (startDate: string, minutesToAdd: number) => {
  const date = new Date(startDate);
  date.setMinutes(date.getMinutes() + minutesToAdd);

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getBlockColorClass = (duration: number) => {
  if (duration <= 0) {
    return "bg-gray-400";
  }
  const colorIndex = Math.floor(duration / 5) % jobColors.length;
  return jobColors[colorIndex];
};

function LegendTable({ legend }: { legend: IGanttLegendItem[] }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Legenda</h3>
      <div className="rounded-md border border-gray-300 max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                #
              </th>
              <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Pedido
              </th>
              <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Cliente
              </th>
              <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Produto
              </th>
              <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Demanda
              </th>
              <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Início
              </th>
              <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Finalização
              </th>
            </tr>
          </thead>
          <tbody>
            {legend.map((item, rowIndex) => (
              <tr
                key={item.index}
                className={`border-t border-gray-200 ${
                  rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100 transition-colors`}
              >
                <td className="px-4 py-3 text-sm text-gray-900 font-medium text-center">
                  {item.index}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {item.pedido || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {item.cliente || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {item.produto || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {item.demanda || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap text-center">
                  {item.inicio || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap text-center">
                  {item.finalizacao || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chart({ id }: IRun) {
  const { data, isFetching } = useQuery({
    queryKey: ["ganntChartData", id],
    queryFn: async () => {
      const { data } = await apiClient.get<IGanttResponse>(
        `/schedule-reports/${id}/gantt`,
      );
      return data;
    },
  });

  const maxTimeline = useMemo(() => {
    if (!data?.lines?.length) {
      return 0;
    }

    return Math.max(...data.lines.map((line) => line.total_time), 1);
  }, [data]);

  const timelineTicks = useMemo(() => {
    const parts = 4;
    return Array.from({ length: parts + 1 }, (_, index) => {
      const minute = (maxTimeline / parts) * index;
      return {
        minute,
        position: (index / parts) * 100,
      };
    });
  }, [maxTimeline]);

  const timelineMinWidth = useMemo(() => {
    return Math.max(900, Math.ceil(maxTimeline * 2));
  }, [maxTimeline]);

  if (isFetching) {
    return <Loader message="Carregando o gráfico de Gantt" />;
  }

  if (!data?.lines?.length) {
    return (
      <p className="text-sm text-gray-600">
        Nenhum dado de Gantt disponível para esse sequenciamento.
      </p>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      <div className="text-sm text-gray-700">
        <p>
          <span className="font-semibold">Início do sequenciamento:</span>{" "}
          {formatDateTime(data.sequencing_start)}
        </p>
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className="space-y-6"
          style={{ minWidth: `${timelineMinWidth}px` }}
        >
          {/* <div className="rounded-md border p-3 bg-gray-50 space-y-2">
            <p className="text-xs font-semibold text-gray-700">
              Escala de horários
            </p>
            <div className="relative h-6">
              <div className="absolute top-2 left-0 right-0 h-px bg-gray-300" />
              {timelineTicks.map((tick, index) => (
                <div
                  key={`${tick.minute}-${index}`}
                  className="absolute top-0 -translate-x-1/2"
                  style={{ left: `${tick.position}%` }}
                >
                  <div className="h-2 w-px bg-gray-400 mx-auto" />
                  <span className="mt-1 block text-[10px] text-gray-600 whitespace-nowrap">
                    {formatTimelineTime(data.sequencing_start, tick.minute)}
                  </span>
                </div>
              ))}
            </div>
          </div> */}

          {data.lines.map((line) => (
            <div key={line.line_id} className="rounded-md border p-3 space-y-3">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {line.line_name}
                </h3>
                <span className="text-xs text-gray-600 shrink-0">
                  Tempo total: {formatMinutes(line.total_time)} Horas
                </span>
              </div>

              <div className="space-y-4">
                {line.machines.map((machine) => (
                  <div key={machine.id} className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {machine.name}
                    </p>
                    <div className="relative h-8 rounded bg-gray-100 overflow-hidden">
                      {machine.blocks.map((block, index) => {
                        const left = (block.start / maxTimeline) * 100;
                        const width = Math.max(
                          (block.duration / maxTimeline) * 100,
                          0.8,
                        );

                        return (
                          <div
                            key={`${machine.id}-${block.job_id}-${index}-${block.start}`}
                            className={`absolute top-0 h-full border-2 border-black ${getBlockColorClass(block.duration)}`}
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                            }}
                            title={`Pedido ${block.label} • ${formatMinutes(block.duration)} min`}
                          >
                            <span className="text-md text-center text-white font-semibold px-1 leading-8 block truncate">
                              {block.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Gerado em {formatDateTime(data.generated_at)}
      </p>

      {data.legend && data.legend.length > 0 && (
        <LegendTable legend={data.legend} />
      )}
    </div>
  );
}

function GantChart({ id }: { id: number }) {
  if (!id) {
    return <p>Nenhum sequenciamento disponível.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="mt-4 overflow-y-auto">
        <Chart id={id} />
      </div>
    </div>
  );
}

export default GantChart;
