import { useState } from "react";
import { BiPlus } from "react-icons/bi";
import { toast } from "react-toastify";
import { hideMoldFields } from "../../../../config/featureFlags";
import { useSteps } from "../../../../hooks/useStep";
import {
  criarStepsSequenciamentoschema,
  type ICriaStepsSequenciamentoBody,
} from "../../../../schemas/steps";
import Modal from "../../modal";
import FormNovoEstado from "./formNovoEstadoMaquina";

const ESTADO_ATUAL_MAQUINA_STORAGE_KEY = "estado_atual_maquina";

function EstadoAtualMaquina() {
  const [isModalNovoEstadoVisible, setIsModalNovoEstadoVisible] =
    useState(false);

  const [estadoAtualMaquina, setEstadoAtualMaquina] = useState<
    ICriaStepsSequenciamentoBody["estadoAtualMaquina"]
  >(() => {
    const fromStorage = localStorage.getItem(ESTADO_ATUAL_MAQUINA_STORAGE_KEY);

    if (!fromStorage) {
      return [];
    }

    try {
      const parsed = JSON.parse(fromStorage);
      return Array.isArray(parsed)
        ? (parsed as ICriaStepsSequenciamentoBody["estadoAtualMaquina"])
        : [];
    } catch {
      return [];
    }
  });

  const { nextStep, prevStep } = useSteps();

  const adicionarEstadoAtualMaquina = (
    data: ICriaStepsSequenciamentoBody["estadoAtualMaquina"][number],
  ) => {
    setEstadoAtualMaquina((prev) => [...prev, data]);
  };

  const removerEstadoAtualMaquina = (index: number) => {
    setEstadoAtualMaquina((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleProsseguir = () => {
    if (estadoAtualMaquina.length === 0) {
      toast.error("Cadastre pelo menos uma máquina para prosseguir.");
      return;
    }

    const isValid =
      criarStepsSequenciamentoschema.shape.estadoAtualMaquina.safeParse(
        estadoAtualMaquina,
      );

    if (!isValid.success) {
      const fieldLabels: Record<string, string> = {
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
        dataLimiteFaturamento: "Data limite de faturamento",
        horarioLimiteFaturamento: "Horário limite de faturamento",
      };

      const detalhesErros = isValid.error.issues.map((issue) => {
        const indexPath = issue.path[0];
        const fieldPath = issue.path[1];

        const linha =
          typeof indexPath === "number"
            ? `Máquina ${indexPath + 1}`
            : "Registro";
        const campoKey = String(fieldPath ?? "");
        const campo = (fieldLabels[campoKey] ?? campoKey) || "Campo inválido";

        return `• ${linha} - ${campo}: ${issue.message}`;
      });

      toast.error(
        `Encontramos alguns campos inválidos:\n${detalhesErros.join("\n")}`,
      );
      return;
    }

    localStorage.setItem(
      ESTADO_ATUAL_MAQUINA_STORAGE_KEY,
      JSON.stringify(estadoAtualMaquina),
    );

    nextStep();
  };

  return (
    <div className="bg-white w-full overflow-y-auto max-h-full rounded-lg p-4">
      <Modal.Root isVisible={isModalNovoEstadoVisible}>
        <Modal.Container className="w-1/2 mx-auto">
          <Modal.Header
            title="Novo Estado da Máquina"
            onClose={() => {
              setIsModalNovoEstadoVisible(false);
            }}
          />
          <FormNovoEstado
            onAddEstadoAtualMaquina={adicionarEstadoAtualMaquina}
            setIsModalNovoEstadoVisible={setIsModalNovoEstadoVisible}
          />
        </Modal.Container>
      </Modal.Root>

      <h2 className="text-xl text-[#5B85D5] font-bold mb-4">
        Estado Atual da Máquina
      </h2>
      <div className="overflow-auto max-h-[370px] w-full max-w-[1000px]">
        {estadoAtualMaquina.length === 0 && (
          <p className="text-gray-500 text-center py-20">
            Nenhuma máquina cadastrada no início do sequenciamento.
          </p>
        )}
        {estadoAtualMaquina.length > 0 && (
          <table className="text-xs min-w-full">
            <thead>
              <tr>
                <th className="px-2 py-2">Máquinas Cadastradas</th>
                <th className="px-2 py-2">Utilização</th>
                {!hideMoldFields && (
                  <th className="px-2 py-2">
                    Código do Molde em Máquina no Início do Sequenciamento
                  </th>
                )}
                <th className="px-2 py-2">
                  Produto em Máquina no Início do Sequenciamento
                </th>
                <th className="px-2 py-2">
                  Status do Pedido na Máquina no Início do Sequenciamento
                </th>
                <th className="px-2 py-2">Número do Pedido</th>
                <th className="px-2 py-2">
                  Tempo restantes de produção na Injetora (min)
                </th>
                <th className="px-2 py-2">
                  Tempo restantes de produção pós Injetora (min)
                </th>
                <th className="px-2 py-2">Demanda</th>
                <th className="px-2 py-2">Valor a ser Faturado</th>
                <th className="px-2 py-2">Data Limite de Faturamento</th>
                <th className="px-2 py-2">Horário Limite de Faturamento</th>
                <th className="px-2 py-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {estadoAtualMaquina.map((row, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  <td className="px-2 py-2 border text-center">
                    {row.maquina_name || row.maquina || "Máquina sem nome"}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {row.utilizacao ? "Sim" : "Não"}
                  </td>
                  {!hideMoldFields && (
                    <td className="px-2 py-2 border text-center">
                      {row.codMolde}
                    </td>
                  )}
                  <td className="px-2 py-2 border text-center">
                    {row.prodMaquinaInicioSequenciamento}
                  </td>
                  <td className="px-2 py-2 border text-center">{row.status}</td>
                  <td className="px-2 py-2 border text-center">
                    {row.numeroPedido}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {row.tempoRestanteProdInjetora || "-"}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {row.tempoRestanteProdPosInjetora || "-"}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {row.demanda
                      ? Intl.NumberFormat("pt-BR", {
                          style: "decimal",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(Number(row.demanda))
                      : "-"}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {row.valorAFAturar
                      ? Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(row.valorAFAturar))
                      : "-"}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {row.dataLimiteFaturamento || "-"}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {row.horarioLimiteFaturamento || "-"}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    <button
                      onClick={() => removerEstadoAtualMaquina(idx)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="w-full  flex justify-center">
        <button
          onClick={() => setIsModalNovoEstadoVisible(true)}
          className="cursor-pointer flex gap-2 items-center bg-gray-500 text-white hover:bg-gray-700 transition-colors duration-200 py-2 px-4 rounded-lg mt-4"
        >
          <BiPlus size={20} />
          Adicionar
        </button>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={prevStep}
          className={`px-4 py-2 rounded bg-gray-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer`}
        >
          Voltar
        </button>
        <button
          onClick={handleProsseguir}
          disabled={estadoAtualMaquina.length === 0}
          className={`px-4 py-2 rounded bg-blue-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer`}
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default EstadoAtualMaquina;
