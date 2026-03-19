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
  machines: IGanttMachine[];
}

interface IGanttResponse {
  run_id: number;
  sequencing_start: string;
  lines: IGanttLine[];
  generated_at: string;
}

const jobColors = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
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

const getBlockColorClass = (jobId: number) => {
  if (jobId === 0) {
    return "bg-gray-400";
  }

  return jobColors[Math.abs(jobId) % jobColors.length];
};

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
                  Linha {line.line_id}
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
                            className={`absolute top-0 h-full border-2 border-black ${getBlockColorClass(block.job_id)}`}
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
    </div>
  );
}

function GantChart({ id }: { id: number }) {
  if (!id) {
    return <p>Nenhum sequenciamento disponível.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="mt-4">
        <Chart id={id} />
      </div>
    </div>
  );
}

export default GantChart;
