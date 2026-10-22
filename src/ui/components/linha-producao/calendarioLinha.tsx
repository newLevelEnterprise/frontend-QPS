import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";

type Weekday =
  | "Segunda-feira"
  | "Terça-feira"
  | "Quarta-feira"
  | "Quinta-feira"
  | "Sexta-feira"
  | "Sábado"
  | "Domingo";

type Period = "manha" | "tarde" | "noite";

interface CalendarDay {
  dia_semana: Weekday;
  manha_inicio: string | null;
  manha_fim: string | null;
  tarde_inicio: string | null;
  tarde_fim: string | null;
  noite_inicio: string | null;
  noite_fim: string | null;
  status: "Ativo" | "Parcial" | "Inativo";
}

interface CalendarResponse {
  production_line_id: number;
  days: CalendarDay[];
}

const DEFAULT_TIMES: Record<Period, [string, string]> = {
  manha: ["06:00", "14:00"],
  tarde: ["14:00", "22:00"],
  noite: ["22:00", "06:00"],
};

const STATUS_CLASS: Record<CalendarDay["status"], string> = {
  Ativo: "bg-green-100 text-green-700",
  Parcial: "bg-amber-100 text-amber-700",
  Inativo: "bg-red-100 text-red-700",
};

function clock(value: string | null) {
  return value ? value.slice(0, 5) : "";
}

function formatPeriod(start: string | null, end: string | null) {
  if (!start || !end) return "Parado";
  return `${clock(start)} - ${clock(end)}`;
}

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  }
  return fallback;
}

interface CalendarioLinhaProps {
  linhaId: string;
  linhaNome?: string;
}

type TimeField =
  | "manha_inicio"
  | "manha_fim"
  | "tarde_inicio"
  | "tarde_fim"
  | "noite_inicio"
  | "noite_fim";

function ShiftEditor({
  label,
  enabled,
  start,
  end,
  onToggle,
  onStart,
  onEnd,
}: {
  label: string;
  enabled: boolean;
  start: string | null;
  end: string | null;
  onToggle: (enabled: boolean) => void;
  onStart: (value: string) => void;
  onEnd: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="relative inline-block h-[26px] w-[46px] shrink-0 cursor-pointer">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={enabled}
          aria-label={label}
          onChange={(event) => onToggle(event.target.checked)}
        />
        <span className="absolute inset-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600" />
        <span className="absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </label>
      {enabled ? (
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={clock(start)}
            aria-label={`${label} início`}
            onChange={(event) => onStart(event.target.value)}
            className="h-[42px] w-[136px] rounded-lg border border-slate-300 px-2 text-[15px]"
          />
          <span className="text-slate-500">→</span>
          <input
            type="time"
            value={clock(end)}
            aria-label={`${label} fim`}
            onChange={(event) => onEnd(event.target.value)}
            className="h-[42px] w-[136px] rounded-lg border border-slate-300 px-2 text-[15px]"
          />
        </div>
      ) : (
        <div className="flex h-[42px] min-w-[180px] items-center justify-center rounded-lg bg-slate-100 text-slate-400">
          —
        </div>
      )}
    </div>
  );
}

function CalendarioLinha({ linhaId, linhaNome }: CalendarioLinhaProps) {
  const queryClient = useQueryClient();
  const productionLineId = Number(linhaId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CalendarDay[]>([]);
  const queryKey = ["get", "line-calendar", linhaId];

  const { data, isFetching, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: calendar } = await apiClient.get<CalendarResponse>(
        `/production-lines/${productionLineId}/calendar`,
      );
      return calendar;
    },
    enabled: Number.isFinite(productionLineId) && productionLineId > 0,
  });

  const save = useMutation({
    mutationFn: async (days: CalendarDay[]) => {
      const payload = {
        days: days.map((day) => ({
          dia_semana: day.dia_semana,
          manha_inicio: day.manha_inicio,
          manha_fim: day.manha_fim,
          tarde_inicio: day.tarde_inicio,
          tarde_fim: day.tarde_fim,
          noite_inicio: day.noite_inicio,
          noite_fim: day.noite_fim,
        })),
      };
      await apiClient.put(`/production-lines/${productionLineId}/calendar`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setEditing(false);
      toast.success("Calendário da linha salvo");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Erro ao salvar o calendário da linha."));
    },
  });

  const openEdit = () => {
    setDraft((data?.days ?? []).map((day) => ({ ...day })));
    setEditing(true);
  };

  const setPeriod = (index: number, period: Period, enabled: boolean) => {
    setDraft((current) =>
      current.map((day, dayIndex) => {
        if (dayIndex !== index) return day;
        const [start, end] = DEFAULT_TIMES[period];
        const next = { ...day };
        if (period === "manha") {
          next.manha_inicio = enabled ? day.manha_inicio || start : null;
          next.manha_fim = enabled ? day.manha_fim || end : null;
        }
        if (period === "tarde") {
          next.tarde_inicio = enabled ? day.tarde_inicio || start : null;
          next.tarde_fim = enabled ? day.tarde_fim || end : null;
        }
        if (period === "noite") {
          next.noite_inicio = enabled ? day.noite_inicio || start : null;
          next.noite_fim = enabled ? day.noite_fim || end : null;
        }
        return next;
      }),
    );
  };

  const setTime = (index: number, field: TimeField, value: string) => {
    setDraft((current) =>
      current.map((day, dayIndex) =>
        dayIndex === index ? { ...day, [field]: value || null } : day,
      ),
    );
  };

  const copyMondayToWeekdays = () => {
    setDraft((current) => {
      const monday = current[0];
      if (!monday) return current;
      return current.map((day, index) => {
        if (index < 1 || index > 4) return day;
        return {
          ...day,
          manha_inicio: monday.manha_inicio,
          manha_fim: monday.manha_fim,
          tarde_inicio: monday.tarde_inicio,
          tarde_fim: monday.tarde_fim,
          noite_inicio: monday.noite_inicio,
          noite_fim: monday.noite_fim,
        };
      });
    });
  };

  const clearAll = () => {
    setDraft((current) =>
      current.map((day) => ({
        ...day,
        manha_inicio: null,
        manha_fim: null,
        tarde_inicio: null,
        tarde_fim: null,
        noite_inicio: null,
        noite_fim: null,
      })),
    );
  };

  const days = data?.days ?? [];

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg text-[#5B85D5] font-bold">Calendário da Linha</h2>
          <p className="text-sm text-gray-500">
            Horários de operação configurados para esta linha.
          </p>
        </div>
        <button
          type="button"
          onClick={openEdit}
          disabled={isFetching || isError || days.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md cursor-pointer"
        >
          Editar calendário
        </button>
      </div>

      {isFetching && <Loader message="Carregando o calendário da linha" />}
      {isError && (
        <p className="mt-4 text-sm text-red-600">
          Não foi possível carregar o calendário desta linha.
        </p>
      )}

      {!isFetching && !isError && (
        <div className="border border-gray-200 rounded-lg overflow-x-auto shadow-sm mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Dia da Semana
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Manhã
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Tarde
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Noite
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.dia_semana} className="border-b border-gray-200 last:border-b-0">
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">{day.dia_semana}</td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {formatPeriod(day.manha_inicio, day.manha_fim)}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {formatPeriod(day.tarde_inicio, day.tarde_fim)}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {formatPeriod(day.noite_inicio, day.noite_fim)}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[day.status]}`}
                    >
                      {day.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal.Root isVisible={editing} full>
        <form
          className="flex max-h-[92vh] w-[min(1400px,96vw)] flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(draft);
          }}
        >
          <div className="flex items-start justify-between gap-5 border-b border-gray-200 px-[34px] pb-[22px] pt-7">
            <div>
              <h2 className="mb-2 text-[30px] font-normal leading-none text-gray-800">
                Editar calendário
              </h2>
              <p className="text-gray-500">
                Configure os horários de operação da {linhaNome?.trim() || "linha"}.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={copyMondayToWeekdays}
                className="cursor-pointer rounded-[9px] border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"
              >
                Copiar segunda para seg-sex
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="cursor-pointer rounded-[9px] border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800"
              >
                Limpar todos
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Fechar"
                className="cursor-pointer px-1 text-[28px] leading-none text-gray-800"
              >
                ×
              </button>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr>
                  <th className="w-[14%] border-b border-gray-200 bg-slate-50 px-4 py-[15px] text-left font-semibold text-gray-800">
                    Dia
                  </th>
                  <th className="border-b border-gray-200 bg-slate-50 px-4 py-[15px] text-left font-semibold text-gray-800">
                    Manhã
                  </th>
                  <th className="border-b border-gray-200 bg-slate-50 px-4 py-[15px] text-left font-semibold text-gray-800">
                    Tarde
                  </th>
                  <th className="border-b border-gray-200 bg-slate-50 px-4 py-[15px] text-left font-semibold text-gray-800">
                    Noite
                  </th>
                </tr>
              </thead>
              <tbody>
                {draft.map((day, index) => (
                  <tr key={day.dia_semana}>
                    <td className="border-b border-gray-200 px-4 py-4 font-semibold text-gray-800">
                      {day.dia_semana}
                    </td>
                    {(["manha", "tarde", "noite"] as Period[]).map((period) => {
                      const start = day[`${period}_inicio`];
                      const end = day[`${period}_fim`];
                      const periodLabel =
                        period === "manha" ? "Manhã" : period === "tarde" ? "Tarde" : "Noite";
                      return (
                        <td key={period} className="border-b border-gray-200 px-4 py-4">
                          <ShiftEditor
                            label={`${periodLabel} ${day.dia_semana}`}
                            enabled={Boolean(start || end)}
                            start={start}
                            end={end}
                            onToggle={(enabled) => setPeriod(index, period, enabled)}
                            onStart={(value) => setTime(index, `${period}_inicio`, value)}
                            onEnd={(value) => setTime(index, `${period}_fim`, value)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-5 px-[34px] pb-7 pt-[22px]">
            <div className="rounded-[9px] border border-blue-200 bg-blue-50 px-4 py-3.5 text-sm text-slate-600">
              Esses horários serão utilizados no cálculo operacional apenas para esta linha de produção.
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="cursor-pointer rounded-[9px] border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={save.isPending}
                className="cursor-pointer rounded-[9px] border border-blue-600 bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-blue-300 disabled:border-blue-300"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
      </Modal.Root>
    </div>
  );
}

export default CalendarioLinha;
