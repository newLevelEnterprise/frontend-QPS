import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSteps } from "../../../../hooks/useStep";
import {
  criarStepsSequenciamentoschema,
  type ICriaStepsSequenciamentoBody,
} from "../../../../schemas/steps";
import { apiClient } from "../../../../utils/apiClient";

const SEQUENCIAMENTO_INFO_STORAGE_KEY = "sequenciamento_info";

const defaultSequenciamentoInfo: ICriaStepsSequenciamentoBody["sequenciamento"] =
  {
    dataInicio: "",
    horarioInicio: "",
    regimeFaturamento: "",
    horarioLimiteFaturamento: undefined,
    sabadoTrabalha: false,
  };

function SequenciamentoInfo() {
  const { resetSteps } = useSteps();
  const [sequenciamentoInfo, setSequenciamentoInfo] = useState<
    ICriaStepsSequenciamentoBody["sequenciamento"]
  >(() => {
    const fromStorage = localStorage.getItem(SEQUENCIAMENTO_INFO_STORAGE_KEY);

    if (!fromStorage) {
      return defaultSequenciamentoInfo;
    }

    try {
      const parsed = JSON.parse(fromStorage);
      return {
        ...defaultSequenciamentoInfo,
        ...parsed,
        sabadoTrabalha: Boolean(parsed?.sabadoTrabalha),
      };
    } catch {
      return defaultSequenciamentoInfo;
    }
  });

  const { data: billingActivated, isFetching } = useQuery({
    queryKey: ["sequenciamentoInfo", 1],
    queryFn: async () => {
      const { data } = await apiClient.get<
        {
          rule_type: string;
          billing_deadline_time: string;
          rule_type_index: number;
        }[]
      >("/billing-configuration/");
      return data[0];
    },
  });

  useEffect(() => {
    if (billingActivated) {
      setSequenciamentoInfo((prev) => ({
        ...prev,
        regimeFaturamento: billingActivated.rule_type_index.toString(),
        horarioLimiteFaturamento:
          billingActivated.rule_type_index === 4
            ? undefined
            : billingActivated.billing_deadline_time,
      }));
    }
  }, [isFetching, billingActivated]);

  const { nextStep } = useSteps();

  const handleProsseguir = () => {
    const isValid =
      criarStepsSequenciamentoschema.shape.sequenciamento.safeParse(
        sequenciamentoInfo,
      );

    if (!isValid.success) {
      const fieldLabels: Record<string, string> = {
        dataInicio: "Dia de início",
        horarioInicio: "Hora de início",
        regimeFaturamento: "Regime de faturamento",
        horarioLimiteFaturamento: "Horário limite de faturamento",
        sabadoTrabalha: "Sábado é dia de trabalho",
      };

      const errosFormatados = isValid.error.issues.map((issue) => {
        const fieldName = String(issue.path[0] ?? "");
        const fieldLabel = fieldLabels[fieldName] ?? fieldName;

        return `• ${fieldLabel}: ${issue.message}`;
      });

      toast.error(`Confira os campos abaixo:\n${errosFormatados.join("\n")}`);
      return;
    }

    const data = {
      ...isValid.data,
      horarioLimiteFaturamento:
        sequenciamentoInfo.regimeFaturamento === "4"
          ? undefined
          : sequenciamentoInfo.horarioLimiteFaturamento,
    };

    localStorage.setItem(SEQUENCIAMENTO_INFO_STORAGE_KEY, JSON.stringify(data));

    nextStep();
  };

  return (
    <div className="bg-white w-full overflow-y-auto max-h-full rounded-lg p-4">
      <h2 className="text-[#3573C9] text-lg font-bold mb-2">Sequenciamento</h2>

      <form className="flex flex-col gap-8 mt-2">
        <div>
          <label className="font-semibold mb-4">Início do Sequenciamento</label>
          <div className="flex gap-4 mt-2">
            <div className="flex gap-2 items-center">
              <label className="font-semibold text-gray-700">Dia:</label>
              <input
                type="date"
                className="border rounded px-2 py-1 w-32"
                value={sequenciamentoInfo.dataInicio}
                onChange={(event) =>
                  setSequenciamentoInfo((prev) => ({
                    ...prev,
                    dataInicio: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="font-semibold text-gray-700">Hora:</label>
              <input
                type="time"
                className="border rounded px-2 py-1 w-24"
                value={sequenciamentoInfo.horarioInicio}
                onChange={(event) =>
                  setSequenciamentoInfo((prev) => ({
                    ...prev,
                    horarioInicio: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Regime de Faturamento
          </label>
          <div className="flex gap-2 w-full items-center mt-1">
            <div className="flex items-center gap-2">
              <select
                disabled={isFetching}
                className={clsx(
                  "border rounded px-2 py-1 w-full max-w-xs",
                  isFetching && "bg-gray-50 animate-pulse",
                )}
                value={sequenciamentoInfo.regimeFaturamento}
                onChange={(event) =>
                  setSequenciamentoInfo((prev) => ({
                    ...prev,
                    regimeFaturamento: event.target.value,
                  }))
                }
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                <option value="1">Segunda a Sexta (sem feriados)</option>
                <option value="2">Todos os dias (incluindo feriados)</option>
                <option value="3">Todos os dias (sem feriados)</option>
                <option value="4">
                  Todos os dias e em qualquer horário (incluindo feriados)
                </option>
              </select>
            </div>
            {sequenciamentoInfo.regimeFaturamento !== "4" && (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="time"
                  className={clsx(
                    "border rounded px-2 py-1 w-24",
                    isFetching && "bg-gray-50 animate-pulse",
                  )}
                  disabled={isFetching}
                  value={sequenciamentoInfo.horarioLimiteFaturamento}
                  onChange={(event) =>
                    setSequenciamentoInfo((prev) => ({
                      ...prev,
                      horarioLimiteFaturamento: event.target.value,
                    }))
                  }
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-2">
          <label className="block font-semibold mb-1">
            O sábado seguinte a esta data é dia de trabalho regular?
          </label>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                className="accent-[#3573C9]"
                checked={sequenciamentoInfo.sabadoTrabalha}
                onChange={() =>
                  setSequenciamentoInfo((prev) => ({
                    ...prev,
                    sabadoTrabalha: true,
                  }))
                }
              />
              <span>Sim</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                className="accent-[#3573C9]"
                checked={!sequenciamentoInfo.sabadoTrabalha}
                onChange={() =>
                  setSequenciamentoInfo((prev) => ({
                    ...prev,
                    sabadoTrabalha: false,
                  }))
                }
              />
              <span>Não</span>
            </label>
          </div>
        </div>
      </form>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => {
            localStorage.removeItem(SEQUENCIAMENTO_INFO_STORAGE_KEY);
            localStorage.removeItem("estado_atual_maquina");
            localStorage.removeItem("jobs_ids");
            resetSteps();
          }}
          className={`px-4 py-2 rounded bg-gray-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer`}
        >
          Cancelar Sequenciamento
        </button>
        <button
          disabled={isFetching}
          onClick={handleProsseguir}
          className={`px-4 py-2 rounded bg-blue-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer`}
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default SequenciamentoInfo;
