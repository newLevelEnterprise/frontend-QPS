import { useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { useSteps } from "../../../../hooks/useStep";
import type { ICriaStepsSequenciamentoBody } from "../../../../schemas/steps";
import Modal from "../../modal";

type IEstadoAtualMaquinaItem =
  ICriaStepsSequenciamentoBody["estadoAtualMaquina"][number];

const defaultNovoEstado: IEstadoAtualMaquinaItem = {
  maquina: "",
  utilizacao: false,
  codMolde: "",
  prodMaquinaInicioSequenciamento: "",
  status: "Concluido",
  numeroPedido: "",
  tempoRestanteProdInjetora: "",
  tempoRestanteProdPosInjetora: "",
  demanda: "",
  valorAFAturar: "",
  dataLimiteFaturamento: "",
  horarioLimiteFaturamento: "",
};

function EstadoAtualMaquina() {
  const [estadoAtualMaquina, setEstadoAtualMaquina] = useState<
    ICriaStepsSequenciamentoBody["estadoAtualMaquina"]
  >([]);
  const [isModalNovoEstadoVisible, setIsModalNovoEstadoVisible] =
    useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<IEstadoAtualMaquinaItem>({
    defaultValues: defaultNovoEstado,
  });

  const { setValue } = useFormContext<ICriaStepsSequenciamentoBody>();
  const { nextStep, prevStep } = useSteps();

  const adicionarEstadoAtualMaquina = (data: IEstadoAtualMaquinaItem) => {
    setEstadoAtualMaquina((prev) => [...prev, data]);
    reset(defaultNovoEstado);
    setIsModalNovoEstadoVisible(false);
  };

  const removerEstadoAtualMaquina = (index: number) => {
    setEstadoAtualMaquina((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="bg-white w-full overflow-y-auto max-h-full rounded-lg p-4">
      <Modal.Root isVisible={isModalNovoEstadoVisible}>
        <Modal.Container className="w-1/2 mx-auto">
          <Modal.Header
            title="Novo Estado da Máquina"
            onClose={() => {
              reset(defaultNovoEstado);
              setIsModalNovoEstadoVisible(false);
            }}
          />
          <form
            onSubmit={handleSubmit(adicionarEstadoAtualMaquina)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Máquina</label>
              <input
                type="text"
                className="border rounded px-2 py-1"
                {...register("maquina", { required: true })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Código do Molde</label>
              <input
                type="text"
                className="border rounded px-2 py-1"
                {...register("codMolde", { required: true })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">
                Produto na Máquina
              </label>
              <input
                type="text"
                className="border rounded px-2 py-1"
                {...register("prodMaquinaInicioSequenciamento", {
                  required: true,
                })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Status do Pedido</label>
              <select
                className="border rounded px-2 py-1"
                {...register("status", { required: true })}
              >
                <option value="Concluido">Concluido</option>
                <option value="Não concluido">Não concluido</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Número do Pedido</label>
              <input
                type="text"
                className="border rounded px-2 py-1"
                {...register("numeroPedido", { required: true })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Utilização</label>
              <label className="flex items-center gap-2 h-[34px]">
                <input
                  type="checkbox"
                  className="accent-[#5B85D5]"
                  {...register("utilizacao")}
                />
                Em utilização
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">
                Tempo restante na Injetora (min)
              </label>
              <input
                type="number"
                className="border rounded px-2 py-1"
                {...register("tempoRestanteProdInjetora")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">
                Tempo restante pós Injetora (min)
              </label>
              <input
                type="number"
                className="border rounded px-2 py-1"
                {...register("tempoRestanteProdPosInjetora")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Demanda</label>
              <input
                type="text"
                className="border rounded px-2 py-1"
                {...register("demanda")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Valor a Faturar</label>
              <input
                type="text"
                className="border rounded px-2 py-1"
                {...register("valorAFAturar")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">
                Data Limite de Faturamento
              </label>
              <input
                type="date"
                className="border rounded px-2 py-1"
                {...register("dataLimiteFaturamento")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">
                Horário Limite de Faturamento
              </label>
              <input
                type="time"
                className="border rounded px-2 py-1"
                {...register("horarioLimiteFaturamento")}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  reset(defaultNovoEstado);
                  setIsModalNovoEstadoVisible(false);
                }}
                className="px-4 py-2 rounded bg-gray-600 text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </form>
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
                <th className="px-2 py-2">
                  Código do Molde em Máquina no Início do Sequenciamento
                </th>
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
                  <td className="px-2 py-2 border">{row.maquina}</td>
                  <td className="px-2 py-2 border text-center">
                    {row.utilizacao ? "Sim" : "Não"}
                  </td>
                  <td className="px-2 py-2 border">{row.codMolde}</td>
                  <td className="px-2 py-2 border">
                    {row.prodMaquinaInicioSequenciamento}
                  </td>
                  <td className="px-2 py-2 border">{row.status}</td>
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
                    {row.demanda || "-"}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {row.valorAFAturar || "-"}
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
          onClick={() => {
            setValue("estadoAtualMaquina", estadoAtualMaquina);
            nextStep();
          }}
          className={`px-4 py-2 rounded bg-blue-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer`}
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default EstadoAtualMaquina;
