import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { IProductionSchedule } from "../../../types/ProductionSchedule";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";

interface IRun {
  id: number;
}

function Chart({ id }: IRun) {
  return (
    <div>
      <p>ganntt {id}</p>
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

  if (isFetching) {
    return <Loader message="Carregando o gráfico" />;
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

      <div className="mt-4">{runId && <Chart id={runId} />}</div>
    </div>
  );
}

export default GantChart;
