import { useState } from "react";
import { useSteps } from "../../../../hooks/useStep";
import type { IParadas } from "../../../../types/Paradas";
import Modal from "../../modal";
import FormEditarParada from "./formEditarParada";
import FormNovaParada from "./formNovaParada";

function Paradas() {
  const [modalCriarParada, setModalCriarParada] = useState<boolean>(false);
  const [modalEditarParada, setModalEditarParada] = useState<boolean>(false);
  const { prevStep } = useSteps();
  const [parada, setParada] = useState<IParadas>({
    id: 0,
    motivo: "",
    dataInicio: "",
    horaInicio: "",
    dataFim: "",
    horaFim: "",
    maquina: "",
  });

  const paradas = [
    {
      id: 1,
      motivo: "Segunda-feira",
      dataInicio: "00/00/00",
      horaInicio: "00:00",
      dataFim: "00/00/00",
      horaFim: "00/00/00",
      maquina: "Maq 1",
    },
  ];

  const [incluirParadas, setIncluirParadas] = useState(true);

  return (
    <div className="bg-white w-full overflow-y-auto max-h-full rounded-lg p-4">
      <Modal.Root isVisible={modalCriarParada}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Nova Parada"
            onClose={() => setModalCriarParada(false)}
          />
          <FormNovaParada setNovaParada={() => setModalCriarParada(false)} />
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
                    <button className="text-[#F87171] hover:underline">
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
          // onClick={nextStep}
          className={`px-4 py-2 rounded bg-blue-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer`}
        >
          Iniciar
        </button>
      </div>
    </div>
  );
}

export default Paradas;
