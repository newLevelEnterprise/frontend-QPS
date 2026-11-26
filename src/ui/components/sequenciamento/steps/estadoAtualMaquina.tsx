import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { hiddenModeLabel } from "../../../../config/featureFlags";
import { useSteps } from "../../../../hooks/useStep";
import { criarStepsSequenciamentoschema } from "../../../../schemas/steps";
import type { IMaquinasType } from "../../../../types/Maquina";
import { apiClient } from "../../../../utils/apiClient";
import Loader from "../../Loader";
import Modal from "../../modal";
import {
  ESTADO_ATUAL_MAQUINA_STORAGE_KEY,
  MAQUINAS_DESMARCADAS_STORAGE_KEY,
  lerDesmarcadas,
  lerEstadosSalvos,
  marcarUtilizacao,
  montarLinhas,
  salvarEstado,
  validarLinhas,
  type IEstadoMaquina,
  type IMaquinaSequenciamento,
} from "./estadoMaquinas";
import FormNovoEstado from "./formNovoEstadoMaquina";

const th = "border-b border-gray-200 px-3 py-4 text-sm font-semibold text-gray-700";
const td = "border-b border-gray-200 px-3 py-4 text-sm text-gray-900";

const fieldLabels: Record<string, string> = {
  maquina: "Máquina",
  utilizacao: "Utilização",
  codMolde: "Código do molde",
  prodMaquinaInicioSequenciamento: "Produto na máquina",
  status: "Status do pedido",
  numeroPedido: "Número do pedido",
  nome_cliente: "Nome do cliente",
  tempoRestanteProdInjetora: hiddenModeLabel(
    "Tempo restante na injetora",
    "Tempo restante na Maq. Gargalo",
  ),
  tempoRestanteProdPosInjetora: hiddenModeLabel(
    "Tempo restante pós injetora",
    "Tempo restante pós Maq. Gargalo",
  ),
  demanda: "Demanda",
  valorAFAturar: "Valor a faturar",
  dataLimiteFaturamento: "Data limite de faturamento",
  horarioLimiteFaturamento: "Horário limite de faturamento",
};

function EstadoAtualMaquina() {
  const { nextStep, prevStep } = useSteps();
  const [estados, setEstados] = useState<IEstadoMaquina[]>(() =>
    lerEstadosSalvos(localStorage.getItem(ESTADO_ATUAL_MAQUINA_STORAGE_KEY)),
  );
  const [desmarcadas, setDesmarcadas] = useState<number[]>(() =>
    lerDesmarcadas(localStorage.getItem(MAQUINAS_DESMARCADAS_STORAGE_KEY)),
  );
  const [emEdicao, setEmEdicao] = useState<IMaquinaSequenciamento | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const { data: maquinas, isFetching } = useQuery({
    queryKey: ["get", "all", "machines"],
    queryFn: async () => {
      const { data } = await apiClient.get<IMaquinasType[]>("/machines/");
      return data;
    },
  });

  useEffect(() => {
    localStorage.setItem(ESTADO_ATUAL_MAQUINA_STORAGE_KEY, JSON.stringify(estados));
  }, [estados]);

  useEffect(() => {
    localStorage.setItem(MAQUINAS_DESMARCADAS_STORAGE_KEY, JSON.stringify(desmarcadas));
  }, [desmarcadas]);

  const linhas = useMemo(
    () => montarLinhas(maquinas ?? [], estados, desmarcadas),
    [maquinas, estados, desmarcadas],
  );

  const alterarUtilizacao = (maquinaId: number, utilizar: boolean) => {
    const proximo = marcarUtilizacao(estados, desmarcadas, maquinaId, utilizar);
    setEstados(proximo.estados);
    setDesmarcadas(proximo.desmarcadas);
    setErro(null);
  };

  const salvar = (estado: IEstadoMaquina) => {
    setEstados((atuais) => salvarEstado(atuais, estado));
    setEmEdicao(null);
    setErro(null);
  };

  const handleProsseguir = () => {
    const falha = validarLinhas(linhas);
    if (falha) {
      setErro(falha);
      return;
    }

    const selecionadas = linhas.filter((linha) => linha.utilizar);
    for (const linha of selecionadas) {
      const isValid =
        criarStepsSequenciamentoschema.shape.estadoAtualMaquina.element.safeParse(
          linha.estado,
        );
      if (!isValid.success) {
        const issue = isValid.error.issues[0];
        const campoKey = String(issue.path[0] ?? "");
        const campo = (fieldLabels[campoKey] ?? campoKey) || "Campo inválido";
        setErro(`Máquina ${linha.maquina.name} - ${campo}: ${issue.message}`);
        return;
      }
    }

    setErro(null);
    nextStep();
  };

  return (
    <div className="bg-white w-full overflow-y-auto max-h-full rounded-lg p-4">
      <Modal.Root isVisible={emEdicao !== null}>
        <Modal.Container className="w-1/2 mx-auto">
          <Modal.Header
            title="Editar estado atual da máquina"
            onClose={() => setEmEdicao(null)}
          />
          {emEdicao && (
            <FormNovoEstado
              maquina={emEdicao}
              estadoInicial={
                linhas.find((linha) => linha.maquina.id === emEdicao.id)?.estado ?? null
              }
              onSalvar={salvar}
              onCancelar={() => setEmEdicao(null)}
            />
          )}
        </Modal.Container>
      </Modal.Root>

      <h2 className="text-[#3573C9] text-lg font-bold mb-2">Estado Atual da Máquina</h2>

      {isFetching && linhas.length === 0 ? (
        <Loader message="Carregando máquinas" />
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className={th}>Nome</th>
                <th className={`${th} w-[120px] text-center`}>Utilizar</th>
                <th className={`${th} w-[120px] text-right`}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map(({ maquina, utilizar }) => (
                <tr key={maquina.id}>
                  <td className={td}>{maquina.name}</td>
                  <td className={`${td} text-center`}>
                    <input
                      type="checkbox"
                      aria-label={`Utilizar ${maquina.name}`}
                      className="h-4 w-4 accent-[#3573C9]"
                      checked={utilizar}
                      onChange={(event) =>
                        alterarUtilizacao(maquina.id, event.target.checked)
                      }
                    />
                  </td>
                  <td className={`${td} text-right`}>
                    <button
                      type="button"
                      disabled={!utilizar}
                      onClick={() => setEmEdicao(maquina)}
                      className="cursor-pointer text-sm font-medium text-blue-600 transition-colors duration-150 hover:text-blue-800 disabled:cursor-default disabled:opacity-40 disabled:hover:text-blue-600"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {erro && (
        <div role="alert" className="mt-2 text-xs text-red-700">
          {erro}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="px-4 py-2 rounded bg-gray-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
        >
          Voltar
        </button>
        <button
          onClick={handleProsseguir}
          disabled={isFetching && linhas.length === 0}
          className="px-4 py-2 rounded bg-blue-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default EstadoAtualMaquina;
