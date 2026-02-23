import { useState } from "react";
import type { IParadas } from "../../../../types/Paradas";
import Modal from "../../modal";
import FormEditarParada from "./formEditarParada";
import FormNovaParada from "./formNovaParada";

function Paradas() {
  // const queryClient = useQueryClient();
  const [modalCriarParada, setModalCriarParada] = useState<boolean>(false);
  const [modalEditarParada, setModalEditarParada] = useState<boolean>(false);
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
          <button
            className="flex items-center gap-2 bg-[#3573C9] hover:bg-[#285ca0] text-white font-medium rounded-lg p-2 py-2 mx-auto cursor-pointer"
            onClick={() => setModalCriarParada(true)}
          >
            <span>+</span> Adicionar nova parada
          </button>
        </div>
      )}
    </div>
  );
}

export default Paradas;
