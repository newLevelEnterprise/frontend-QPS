import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import type { IMoldes } from "../../../types/Moldes";
import Modal from "../modal";
import FormEditarMolde from "./formEditarMolde";
import FormNovoMolde from "./formNovoMolde";

function Moldes() {
  const queryClient = useQueryClient();
  const [novoMolde, setNovoMolde] = useState<boolean>(false);
  const [editarMolde, setEditarMolde] = useState<boolean>(false);

  const [molde, setMolde] = useState<IMoldes>({
    id: 0,
    nome: "",
    produto: "",
    totalCavidades: 0,
    cavidadesAbertas: 0,
    refugo: 0,
    riscoDeCavidade: 0,
  });

  return (
    <div className="w-full bg-white rounded-md shadow p-4">
      <Modal.Root isVisible={novoMolde}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Novo Molde"
            onClose={() => setNovoMolde(false)}
          />
          <FormNovoMolde
            setMolde={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "moldes"],
              })
            }
            setNovoMolde={setNovoMolde}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={editarMolde}>
        <Modal.Container>
          <Modal.Header
            title="Editar Molde"
            onClose={() => setEditarMolde(false)}
          />
          <FormEditarMolde
            setMolde={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "moldes"],
              })
            }
            setEditarMolde={setEditarMolde}
            molde={molde}
          />
        </Modal.Container>
      </Modal.Root>
      <h1 className="text-xl text-[#5B85D5] font-bold">Moldes</h1>
      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[470px] overflow-x-auto">
        <table className="w-full overflow-x-auto overflow-y-auto">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Nome
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Produto
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Total de Cavidades
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Cavidades Abertas
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Refugo
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Risco de Cavidade
              </th>
              <th className="px-6 py-4 text-right text-xs md:text-sm font-medium text-gray-700">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              // key={maquina.id}
              className="border-b border-gray-200 last:border-b-0"
            >
              <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                teste
              </td>
              <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                teste
              </td>
              <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                teste
              </td>
              <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                teste
              </td>
              <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                teste
              </td>
              <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                teste
              </td>
              <td className="px-6 py-4 text-right">
                <div className="w-full flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setMolde(molde);
                      setEditarMolde(true);
                    }}
                    className="text-blue-600 cursor-pointer hover:text-blue-800 text-xs md:text-sm font-medium transition-colors duration-150"
                  >
                    Editar
                  </button>
                  <button
                    // onClick={() => deletarMaquinaFn(maquina.id)}
                    className="text-red-500 cursor-pointer hover:text-red-700 text-xs md:text-sm font-medium transition-colors duration-150"
                  >
                    Remover
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-4 items-center justify-center mt-4">
        <button
          onClick={() => {
            setNovoMolde(true);
            setMolde({
              id: 0,
              nome: "",
              produto: "",
              totalCavidades: 0,
              cavidadesAbertas: 0,
              refugo: 0,
              riscoDeCavidade: 0,
            });
          }}
          className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <CiCirclePlus className="w-4 h-4 md:h-6 md:w-6 mr-2" />
          Adicionar Novo Molde
        </button>
      </div>
    </div>
  );
}

export default Moldes;
