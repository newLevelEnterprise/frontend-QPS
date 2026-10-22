import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../utils/apiClient";

type Vigencia = "em_vigor" | "encerrado" | "programado" | "sem_dados";
type VigenciaFilter = "all" | "em_vigor" | "encerrado" | "programado";

interface HistoryResult {
  billing_date?: string | null;
}

interface HistoryItem {
  id: number;
  sequencing_start?: string | null;
  created_at?: string | null;
  results?: HistoryResult[] | null;
}

interface HistoryRow extends HistoryItem {
  lastDelivery: string | null;
  vigencia: Vigencia;
}

const VIGENCIA_LABEL: Record<Vigencia, string> = {
  em_vigor: "Em vigor",
  encerrado: "Encerrado",
  programado: "Programado",
  sem_dados: "Sem dados",
};

const VIGENCIA_CLASS: Record<Vigencia, string> = {
  em_vigor: "bg-[#ecfdf3] text-[#15803d]",
  encerrado: "bg-[#f2f4f7] text-[#667085]",
  programado: "bg-[#fffaeb] text-[#b54708]",
  sem_dados: "bg-[#f2f4f7] text-[#667085]",
};

function parseWallClock(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseCreatedAt(value: string): Date | null {
  const normalized = value.trim().replace(/(\.\d{3})\d+/, "$1");
  const hasZone = /(?:z|[+-]\d{2}:\d{2})$/i.test(normalized);
  const parsed = new Date(hasZone ? normalized : `${normalized}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateTime(date: Date | null): { date: string; time: string } | null {
  if (!date) return null;
  return {
    date: date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function billingDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

function formatBillingDay(day: string): string {
  const [year, month, date] = day.split("-");
  return `${date}/${month}/${year}`;
}

function endOfBillingDay(day: string): Date | null {
  const [year, month, date] = day.split("-").map(Number);
  if (!year || !month || !date) return null;
  return new Date(year, month - 1, date, 23, 59, 59, 999);
}

function maxBillingDay(results: HistoryResult[] | null | undefined): string | null {
  let maxDay: string | null = null;
  for (const result of results ?? []) {
    const day = billingDay(result.billing_date);
    if (day && (!maxDay || day > maxDay)) maxDay = day;
  }
  return maxDay;
}

function resolveVigencia(
  sequencingStart: string | null | undefined,
  lastDelivery: string | null,
  now: Date,
): Vigencia {
  if (!sequencingStart || !lastDelivery) return "sem_dados";
  const start = parseWallClock(sequencingStart);
  const end = endOfBillingDay(lastDelivery);
  if (!start || !end) return "sem_dados";
  if (now < start) return "programado";
  if (now <= end) return "em_vigor";
  return "encerrado";
}

function DateCell({
  date,
  time,
}: {
  date: string | null;
  time?: string | null;
}) {
  if (!date) {
    return <span className="text-[#667085]">—</span>;
  }

  return (
    <span>
      <span className="block font-semibold text-[#111827]">{date}</span>
      {time ? (
        <span className="mt-0.5 block text-xs text-[#667085]">{time}</span>
      ) : null}
    </span>
  );
}

function HistoryPage() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vigenciaFilter, setVigenciaFilter] = useState<VigenciaFilter>("all");

  useEffect(() => {
    async function getHistory() {
      try {
        setIsLoading(true);
        const { data } = await apiClient.get<HistoryItem[]>("/production-schedule");
        setHistoryData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log(error);
        setHistoryData([]);
      } finally {
        setIsLoading(false);
      }
    }
    getHistory();
  }, []);

  const rows = useMemo<HistoryRow[]>(() => {
    const now = new Date();
    return historyData
      .map((item) => {
        const lastDelivery = maxBillingDay(item.results);
        return {
          ...item,
          lastDelivery,
          vigencia: resolveVigencia(item.sequencing_start, lastDelivery, now),
        };
      })
      .sort((left, right) => {
        const leftCreated = left.created_at ? parseCreatedAt(left.created_at)?.getTime() ?? 0 : 0;
        const rightCreated = right.created_at
          ? parseCreatedAt(right.created_at)?.getTime() ?? 0
          : 0;
        if (rightCreated !== leftCreated) return rightCreated - leftCreated;
        return right.id - left.id;
      });
  }, [historyData]);

  const emVigorCount = rows.filter((row) => row.vigencia === "em_vigor").length;

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (vigenciaFilter !== "all" && row.vigencia !== vigenciaFilter) return false;
      if (!query) return true;

      const processed = formatDateTime(
        row.created_at ? parseCreatedAt(row.created_at) : null,
      );
      const start = formatDateTime(
        row.sequencing_start ? parseWallClock(row.sequencing_start) : null,
      );
      const lastDelivery = row.lastDelivery ? formatBillingDay(row.lastDelivery) : "";
      const haystack = [
        String(row.id),
        `#${row.id}`,
        processed?.date,
        processed?.time,
        start?.date,
        start?.time,
        lastDelivery,
        row.created_at,
        row.sequencing_start,
        row.lastDelivery,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [rows, search, vigenciaFilter]);

  const openResult = (id: number) => {
    navigate({
      pathname: "/resultados",
      search: `?id=${id}`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col gap-4 overflow-hidden">
        <h1 className="text-lg font-semibold text-[#4e78df] md:text-xl">
          Histórico de Processamentos
        </h1>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <div className="text-lg text-gray-500">Carregando histórico...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-3 overflow-hidden">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div>
          <h1 className="text-lg font-semibold text-[#4e78df] md:text-xl">
            Histórico de Processamentos
          </h1>
          <p className="mt-1 text-xs text-[#667085]">
            Execuções de sequenciamento realizadas no sistema.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#dfe4ec] bg-white px-3 py-1.5 text-xs text-[#111827]">
            <strong>{rows.length}</strong>{" "}
            {rows.length === 1 ? "processamento" : "processamentos"}
          </span>
          <span className="rounded-full border border-[#dfe4ec] bg-white px-3 py-1.5 text-xs text-[#111827]">
            <strong>{emVigorCount}</strong> em vigor
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          type="search"
          placeholder="Buscar por ID ou data..."
          className="h-9 w-full rounded-full border border-[#cfd6e1] bg-white px-4 text-sm outline-none focus:border-[#1764ff] sm:max-w-sm"
        />
        <select
          value={vigenciaFilter}
          onChange={(event) => setVigenciaFilter(event.target.value as VigenciaFilter)}
          className="h-9 rounded-lg border border-[#cfd6e1] bg-white px-3 text-sm outline-none focus:border-[#1764ff]"
          aria-label="Filtrar por vigência"
        >
          <option value="all">Todos</option>
          <option value="em_vigor">Em vigor</option>
          <option value="encerrado">Encerrados</option>
          <option value="programado">Programados</option>
        </select>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-[#dfe4ec] bg-white shadow-sm">
        {rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-[#667085]">
            Nenhum processamento encontrado.
          </div>
        ) : (
          <table className="w-full min-w-[950px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#dfe4ec] bg-[#fbfcfd] text-left text-xs font-bold text-[#111827]">
                <th className="whitespace-nowrap px-4 py-3">ID</th>
                <th className="whitespace-nowrap px-4 py-3">Processado em</th>
                <th className="whitespace-nowrap px-4 py-3">Início da execução</th>
                <th className="whitespace-nowrap px-4 py-3">Última entrega</th>
                <th className="whitespace-nowrap px-4 py-3">Vigência</th>
                <th className="whitespace-nowrap px-4 py-3">Processamento</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#667085]">
                    Nenhum processamento encontrado.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => {
                  const processed = formatDateTime(
                    row.created_at ? parseCreatedAt(row.created_at) : null,
                  );
                  const start = formatDateTime(
                    row.sequencing_start ? parseWallClock(row.sequencing_start) : null,
                  );

                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-[#dfe4ec] last:border-b-0 ${
                        row.vigencia === "em_vigor" ? "bg-[#fbfffc]" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3.5 font-bold text-[#344054]">#{row.id}</td>
                      <td className="px-4 py-3.5">
                        <DateCell date={processed?.date ?? null} time={processed?.time} />
                      </td>
                      <td className="px-4 py-3.5">
                        <DateCell date={start?.date ?? null} time={start?.time} />
                      </td>
                      <td className="px-4 py-3.5">
                        <DateCell
                          date={row.lastDelivery ? formatBillingDay(row.lastDelivery) : null}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-bold whitespace-nowrap ${VIGENCIA_CLASS[row.vigencia]}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {VIGENCIA_LABEL[row.vigencia]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-full bg-[#f2f4f7] px-2 py-1 text-[11px] font-medium text-[#475467]">
                          Concluído
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => openResult(row.id)}
                          className="font-semibold text-[#1764ff] hover:underline"
                        >
                          Ver resultado
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <p className="rounded-lg border border-[#dfe4ec] bg-white px-3 py-2.5 text-xs leading-relaxed text-[#475467]">
        <strong>Vigência:</strong> Em vigor enquanto o horário atual estiver entre o início da
        execução e o fim do dia da última data prevista de faturamento. Depois disso, Encerrado.
        Se o início ainda não chegou, Programado. Processamento indica apenas que a execução foi
        concluída.
      </p>
    </div>
  );
}

export default HistoryPage;
