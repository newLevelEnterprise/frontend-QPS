import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { useSteps } from "../../../../hooks/useStep";
import type { ICriaStepsSequenciamentoBody } from "../../../../schemas/steps";

function EstadoAtualMaquina() {
  const [estadoAtualMaquina] = useState<
    ICriaStepsSequenciamentoBody["estadoAtualMaquina"]
  >([]);
  const { setValue } = useFormContext<ICriaStepsSequenciamentoBody>();
  const { nextStep, prevStep } = useSteps();

  return (
    <div className="bg-white w-full overflow-y-auto max-h-full rounded-lg p-4">
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
                <th className="px-2 py-2">Cliente</th>
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
                  <td className="px-2 py-2 border">
                    <select className="border rounded px-1 py-0.5">
                      <option>Maq 1</option>
                      <option>Maq 2</option>
                    </select>
                  </td>
                  <td className="px-2 py-2 border text-center">
                    <input
                      defaultChecked={row.utilizacao}
                      type="checkbox"
                      className="accent-[#5B85D5]"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={row.codMolde}
                      readOnly
                      className="border rounded px-1 py-0.5 w-16 text-center"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <select className="border rounded px-1 py-0.5">
                      <option>Pote Turim Verde</option>
                    </select>
                  </td>
                  <td className="px-2 py-2 border">
                    <select className="border rounded px-1 py-0.5">
                      <option>Concluido</option>
                      <option>Não Concluido</option>
                    </select>
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {idx % 2 === 0 ? "123" : "789"}
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      className="border rounded px-1 py-0.5 w-full"
                      placeholder="Cliente"
                    />
                  </td>
                  <td className="px-2 py-2 border text-center">
                    <input
                      type="number"
                      className="border rounded px-1 py-0.5 w-20 text-center"
                      placeholder="1380"
                    />
                  </td>
                  <td className="px-2 py-2 border text-center">
                    <input
                      type="number"
                      className="border rounded px-1 py-0.5 w-20 text-center"
                      placeholder="500"
                    />
                  </td>
                  <td className="px-2 py-2 border text-center">
                    <input
                      type="text"
                      className="border rounded px-1 py-0.5 w-24 text-center"
                      placeholder="70.000"
                    />
                  </td>
                  <td className="px-2 py-2 border text-center">
                    <input
                      type="text"
                      className="border rounded px-1 py-0.5 w-28 text-center"
                      placeholder="R$ 20.000,00"
                    />
                  </td>
                  <td className="px-2 py-2 border text-center">
                    <input
                      type="date"
                      className="border rounded px-1 py-0.5 w-32 text-center"
                    />
                  </td>
                  <td className="px-2 py-2 border text-center">
                    <input
                      type="time"
                      className="border rounded px-1 py-0.5 w-20 text-center"
                    />
                  </td>
                  <td className="px-2 py-2 border text-center">
                    <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
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
        <button className="cursor-pointer flex gap-2 items-center bg-gray-500 text-white hover:bg-gray-700 transition-colors duration-200 py-2 px-4 rounded-lg mt-4">
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
