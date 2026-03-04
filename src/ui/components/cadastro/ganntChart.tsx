import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { IProductionSchedule } from "../../../types/ProductionSchedule";
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
    <div className="space-y-6">
      <div className="text-sm text-gray-700">
        <p>
          <span className="font-semibold">Run:</span> {data.run_id}
        </p>
        <p>
          <span className="font-semibold">Início do sequenciamento:</span>{" "}
          {formatDateTime(data.sequencing_start)}
        </p>
      </div>

      {data.lines.map((line) => (
        <div key={line.line_id} className="rounded-md border p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Linha {line.line_id}</h3>
            <span className="text-xs text-gray-600">
              Tempo total: {formatMinutes(line.total_time)} min
            </span>
          </div>

          <div className="space-y-4">
            {line.machines.map((machine) => (
              <div key={machine.id} className="space-y-1">
                <p className="text-xs font-medium text-gray-700">
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
                        className={`absolute top-0 h-full border-r border-white ${getBlockColorClass(block.job_id)}`}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                        }}
                        title={`Pedido ${block.label} • ${formatMinutes(block.duration)} min`}
                      >
                        <span className="text-[10px] text-white font-semibold px-1 leading-8 block truncate">
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

      <p className="text-xs text-gray-500">
        Gerado em {formatDateTime(data.generated_at)}
      </p>
    </div>
  );
}

function GantChart() {
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

  useEffect(() => {
    if (!runId && runs?.length) {
      setRunId(runs[0].id);
    }
  }, [runId, runs]);

  if (isFetching) {
    return <Loader message="Carregando o gráfico" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Filtre pelo sequenciamento do dia</h2>
      <select
        value={runId ?? ""}
        onChange={(e) =>
          setRunId(e.target.value ? Number(e.target.value) : null)
        }
        className="p-2 border rounded-md w-full max-w-sm"
      >
        <option value="" disabled>
          Selecione um sequenciamento
        </option>
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

      <div className="mt-4">{runId && <Chart id={runId} />}</div>
    </div>
  );
}

export default GantChart;
