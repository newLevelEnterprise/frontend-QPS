import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../../hooks/useAuth";
import { useSteps } from "../../../../hooks/useStep";
import {
  criarStepsSequenciamentoschema,
  type ICriaStepsSequenciamentoBody,
} from "../../../../schemas/steps";
import type { IParadas } from "../../../../types/Paradas";
import { apiClient } from "../../../../utils/apiClient";
import Modal from "../../modal";
import Loading from "../loading";
import FormEditarParada from "./formEditarParada";
import FormNovaParada from "./formNovaParada";

const SEQUENCIAMENTO_INFO_STORAGE_KEY = "sequenciamento_info";
const ESTADO_ATUAL_MAQUINA_STORAGE_KEY = "estado_atual_maquina";

const formatBillingDeadlineTime = (time: string) => {
  const value = (time || "").trim();

  if (/^\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return value;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return `${value}.000Z`;
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${value}:00.000Z`;
  }

  return value;
};

const formatTimeToHHMMSS = (time: string) => {
  const value = (time || "").trim();

  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }

  return value;
};

const toNumberOrZero = (value: string | number | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const inferMachineId = (machineName: string) => {
  const matches = (machineName || "").match(/\d+/g);

  if (!matches || matches.length === 0) {
    return 0;
  }

  const parsed = Number(matches[matches.length - 1]);
  return Number.isFinite(parsed) ? parsed : 0;
};

function Paradas() {
  const queryClient = useQueryClient();
  const { user_id } = useAuth();
  const { resetSteps } = useSteps();
  const [processing, setProcessing] = useState<boolean>(false);
  const [modalCriarParada, setModalCriarParada] = useState<boolean>(false);
  const [modalEditarParada, setModalEditarParada] = useState<boolean>(false);
  const { prevStep } = useSteps();
  const [parada, setParada] = useState<IParadas>({
    id: 0,
    product_line_id: 0,
    motivo: "",
    dataInicio: "",
    horaInicio: "",
    dataFim: "",
    horaFim: "",
    maquina: "",
  });

  const [paradas, setParadas] = useState<IParadas[]>([]);

  const adicionarParada = (novaParada: Omit<IParadas, "id">) => {
    setParadas((prev) => {
      const proximoId = prev.length
        ? Math.max(...prev.map((paradaAtual) => paradaAtual.id)) + 1
        : 1;

      return [...prev, { id: proximoId, ...novaParada }];
    });

    setModalCriarParada(false);
  };

  const editarParada = (paradaAtualizada: IParadas) => {
    setParadas((prev) =>
      prev.map((paradaAtual) =>
        paradaAtual.id === paradaAtualizada.id ? paradaAtualizada : paradaAtual,
      ),
    );

    setModalEditarParada(false);
  };

  const removerParada = (idParada: number) => {
    setParadas((prev) =>
      prev.filter((paradaAtual) => paradaAtual.id !== idParada),
    );
  };

  const [incluirParadas, setIncluirParadas] = useState(true);

  const safeParseStorage = <T,>(key: string): T | null => {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  };

  const onInitiSequenciamento = async () => {
    setProcessing(true);
    try {
      const jobs_ids = safeParseStorage<number[]>("jobs_ids");
      const sequenciamento = safeParseStorage<
        ICriaStepsSequenciamentoBody["sequenciamento"]
      >(SEQUENCIAMENTO_INFO_STORAGE_KEY);
      const estadoAtualMaquina = safeParseStorage<
        ICriaStepsSequenciamentoBody["estadoAtualMaquina"]
      >(ESTADO_ATUAL_MAQUINA_STORAGE_KEY);

      if (!sequenciamento || !estadoAtualMaquina) {
        toast.error(
          "Não foi possível encontrar os dados dos passos anteriores. Volte e preencha novamente.",
        );
        return;
      }

      const payload: ICriaStepsSequenciamentoBody = {
        sequenciamento,
        estadoAtualMaquina,
        paradasSequenciamento: incluirParadas
          ? paradas.map((paradaAtual) => ({
              production_line_id: paradaAtual.product_line_id.toString(),
              motivo: paradaAtual.motivo,
              maquina: paradaAtual.maquina,
              dataInicio: paradaAtual.dataInicio,
              horarioInicio: paradaAtual.horaInicio,
              dataFim: paradaAtual.dataFim,
              horarioFim: paradaAtual.horaFim,
            }))
          : [],
      };

      if (incluirParadas) {
        if (
          !payload.paradasSequenciamento ||
          payload.paradasSequenciamento.length === 0
        ) {
          toast.error("Cadastre pelo menos uma parada para prosseguir.");
          return;
        }

        const validacaoPayload =
          criarStepsSequenciamentoschema.safeParse(payload);

        if (!validacaoPayload.success) {
          const fieldLabels: Record<string, string> = {
            sequenciamento: "Informações de sequenciamento",
            estadoAtualMaquina: "Estado atual da máquina",
            paradasSequenciamento: "Paradas do sequenciamento",
            dataInicio: "Data de início",
            horarioInicio: "Horário de início",
            regimeFaturamento: "Regime de faturamento",
            horarioLimiteFaturamento: "Horário limite de faturamento",
            sabadoTrabalha: "Sábado é dia útil",
            maquina: "Máquina",
            utilizacao: "Utilização",
            codMolde: "Código do molde",
            prodMaquinaInicioSequenciamento: "Produto na máquina",
            status: "Status do pedido",
            numeroPedido: "Número do pedido",
            nome_cliente: "Nome do cliente",
            tempoRestanteProdInjetora: "Tempo restante na injetora",
            tempoRestanteProdPosInjetora: "Tempo restante pós injetora",
            demanda: "Demanda",
            valorAFAturar: "Valor a faturar",
            motivo: "Motivo da parada",
            dataFim: "Data de finalização",
            horarioFim: "Horário de finalização",
          };

          const detalhes = validacaoPayload.error.issues.map((issue) => {
            const path = issue.path.map((item) => String(item));
            const sectionKey = path[0] ?? "";
            const fieldKey = path[path.length - 1] ?? "";

            const sectionLabel = fieldLabels[sectionKey] ?? sectionKey;
            const fieldLabel = fieldLabels[fieldKey] ?? fieldKey;

            const indexNumber = issue.path.find(
              (item) => typeof item === "number",
            );
            const indexLabel =
              typeof indexNumber === "number" ? ` #${indexNumber + 1}` : "";

            return `• ${sectionLabel}${indexLabel} - ${fieldLabel}: ${issue.message}`;
          });

          toast.error(
            `Encontramos inconsistências nos dados:\n${detalhes.join("\n")}`,
          );
          return;
        }
      }

      await apiClient.post("/billing-configuration/", {
        rule_type: sequenciamento.regimeFaturamento,
        billing_deadline_time: formatBillingDeadlineTime(
          sequenciamento.horarioLimiteFaturamento,
        ),
      });

      await apiClient.post("/solver/solver", {
        jobs_ids: jobs_ids || [],
        sequencing_date: `${sequenciamento.dataInicio}T${sequenciamento.horarioInicio}:00`,
        next_saturday_is_working: sequenciamento.sabadoTrabalha,
        machine_states_json: payload.estadoAtualMaquina.map((estadoAtual) => ({
          production_line_id: Number(estadoAtual.production_line_id),
          machine_id: inferMachineId(estadoAtual.maquina),
          used: estadoAtual.utilizacao,
          mold_name: estadoAtual.codMolde,
          product_name: estadoAtual.prodMaquinaInicioSequenciamento,
          completed: estadoAtual.status === "Concluido",
          order_number: estadoAtual.numeroPedido || "",
          client_name: estadoAtual.nome_cliente || "",
          remaining_injection_hours: toNumberOrZero(
            estadoAtual.tempoRestanteProdInjetora,
          ),
          remaining_post_injection_hours: toNumberOrZero(
            estadoAtual.tempoRestanteProdPosInjetora,
          ),
          demand: toNumberOrZero(estadoAtual.demanda),
          billing_value: toNumberOrZero(estadoAtual.valorAFAturar),
          billing_deadline_date: estadoAtual.dataLimiteFaturamento || "",
          billing_deadline_time: formatTimeToHHMMSS(
            estadoAtual.horarioLimiteFaturamento || "",
          ),
        })),
        programmed_stops_json:
          incluirParadas && payload.paradasSequenciamento
            ? payload.paradasSequenciamento.map((paradaAtual) => ({
                production_line_id: Number(paradaAtual.production_line_id),
                reason: paradaAtual.motivo,
                machine_id: inferMachineId(paradaAtual.maquina),
                start_date: paradaAtual.dataInicio,
                start_time: formatTimeToHHMMSS(paradaAtual.horarioInicio),
                end_date: paradaAtual.dataFim,
                end_time: formatTimeToHHMMSS(paradaAtual.horarioFim),
              }))
            : [],
        user_id,
      });

      toast.success("Dados prontos para iniciar o sequenciamento.");
      localStorage.removeItem(SEQUENCIAMENTO_INFO_STORAGE_KEY);
      localStorage.removeItem(ESTADO_ATUAL_MAQUINA_STORAGE_KEY);
      localStorage.removeItem("jobs_ids");
      resetSteps();
      queryClient.setQueryData(["jobs", "para", "sequenciamento"], () => {
        return [];
      });
    } catch (error) {
      console.log(error);
      toast.error(
        "Ocorreu um erro ao iniciar o sequenciamento. Tente novamente.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white w-full overflow-y-auto max-h-full rounded-lg p-4">
      <Modal.Root isVisible={processing}>
        <Modal.Container>
          <Loading />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={modalCriarParada}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Nova Parada"
            onClose={() => setModalCriarParada(false)}
          />
          <FormNovaParada onCriarParada={adicionarParada} />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={modalEditarParada}>
        <Modal.Container>
          <Modal.Header
            title="Editar Parada"
            onClose={() => setModalEditarParada(false)}
          />
          <FormEditarParada
            setEditarParada={() => setModalEditarParada(false)}
            parada={parada}
            onEditarParada={editarParada}
          />
        </Modal.Container>
      </Modal.Root>
      <h2 className="text-[#3573C9] text-lg font-bold mb-2">Sequenciamento</h2>
      <div className="flex justify-between items-center">
        <div className="mb-4 flex flex-col gap-1">
          <span className="text-sm">
            Deseja incluir paradas programadas no sequenciamento?
          </span>
          <div className="flex items-center gap-6 mt-1">
            <label className="flex items-center gap-1 text-gray-700 text-sm">
              <input
                type="radio"
                checked={incluirParadas}
                onChange={() => setIncluirParadas(true)}
                className="accent-[#5B85D5]"
              />
              Sim
            </label>
            <label className="flex items-center gap-1 text-gray-700 text-sm">
              <input
                type="radio"
                checked={!incluirParadas}
                onChange={() => setIncluirParadas(false)}
                className="accent-[#5B85D5]"
              />
              Não
            </label>
          </div>
        </div>
        <button
          disabled={!incluirParadas}
          className={`flex items-center gap-2 bg-[#3573C9] hover:bg-[#285ca0] text-white font-medium rounded-lg p-2 text-xs cursor-pointer disabled:cursor-not-allowed ${!incluirParadas ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => setModalCriarParada(true)}
        >
          <span>+</span> Adicionar nova parada
        </button>
      </div>
      {incluirParadas && (
        <div className="overflow-auto">
          <table className="min-w-full text-sm mb-4">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2">Motivo</th>
                <th className="px-3 py-2">Data de Início da Parada</th>
                <th className="px-3 py-2">Horário de Início da Parada</th>
                <th className="px-3 py-2">Data de Finalização da Parada</th>
                <th className="px-3 py-2">Horário de Finalização da Parada</th>
                <th className="px-3 py-2">Máquina</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {paradas.map((p) => (
                <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2">{p.motivo}</td>
                  <td className="px-3 py-2">{p.dataInicio}</td>
                  <td className="px-3 py-2">{p.horaInicio}</td>
                  <td className="px-3 py-2">{p.dataFim}</td>
                  <td className="px-3 py-2">{p.horaFim}</td>
                  <td className="px-3 py-2">{p.maquina}</td>
                  <td className="px-3 py-2 flex gap-2 text-sm items-center text-right">
                    <button
                      onClick={() => {
                        setParada(p);
                        setModalEditarParada(true);
                      }}
                      className="text-[#3573C9] hover:underline mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => removerParada(p.id)}
                      className="text-[#F87171] hover:underline"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={prevStep}
          className={`px-4 py-2 rounded bg-gray-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer`}
        >
          Voltar
        </button>
        <button
          disabled={processing}
          onClick={onInitiSequenciamento}
          className={`px-4 py-2 rounded bg-blue-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer`}
        >
          Iniciar
        </button>
      </div>
    </div>
  );
}

export default Paradas;
