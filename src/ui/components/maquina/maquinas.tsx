import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { useParams } from "react-router-dom";
import type { IMaquinas } from "../../../types/Maquina";
import Modal from "../modal";
import FormEditarMaquina from "./formEditarMaquina";
import FormNovaMaquina from "./formNovaMaquina";

function Maquina() {
  const { maquinaId } = useParams();
  const queryClient = useQueryClient();
  const [novaMaquina, setNovaMaquina] = useState<boolean>(false);
  const [editarMaquina, setEditarMaquina] = useState<boolean>(false);

  const [maquina, setMaquina] = useState<IMaquinas>({
    id: 0,
    name: "",
    disponibilidade: 0,
  });

  const maquinas = [];
  return (
    <div className="w-full bg-white rounded-md shadow p-4">
      <Modal.Root isVisible={novaMaquina && maquinas.length < 10}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Nova Máquina"
            onClose={() => setNovaMaquina(false)}
          />
          <FormNovaMaquina
            setMaquina={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "maquinas"],
              })
            }
            setNovaMaquina={setNovaMaquina}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={editarMaquina}>
        <Modal.Container>
          <Modal.Header
            title="Editar Máquina"
            onClose={() => setEditarMaquina(false)}
          />
          <FormEditarMaquina
            setMaquina={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "maquinas"],
              })
            }
            setEditarMaquina={setEditarMaquina}
            maquina={maquina}
          />
        </Modal.Container>
      </Modal.Root>
      <h1 className="text-xl text-[#5B85D5] font-bold">{maquinaId}</h1>
      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[470px] overflow-x-auto">
        <table className="w-full overflow-x-auto overflow-y-auto">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Cód. Molde
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
                Temp. de Ciclo Pós Injeção (s)
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Temp. de Ciclo(s) Maq1
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Temp. de Ciclo(s) Maq2
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Refugo
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Absorver riscos de cav. fechadas
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
                      setEditarMaquina(true);
                      setMaquina(maquina);
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
            setNovaMaquina(true);
            setMaquina({
              id: 0,
              name: "",
              disponibilidade: 0,
            });
          }}
          className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <CiCirclePlus className="w-4 h-4 md:h-6 md:w-6 mr-2" />
          Adicionar Nova Máquina
        </button>
        <p className="text-gray-500 text-lg">
          Pode ser cadastrada até 10 máquinas
        </p>
      </div>
    </div>
  );
}

export default Maquina;
