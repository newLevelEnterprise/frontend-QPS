import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import type { IInsumos } from "../../../types/Insumos";
import Modal from "../modal";
import FormEditarInsumo from "./formEditarMaquina";
import FormNovoInsumo from "./formNovoInsumo";

function Insumos() {
  const queryClient = useQueryClient();
  const [novoInsumo, setNovoInsumo] = useState<boolean>(false);
  const [editarInsumo, setEditarInsumo] = useState<boolean>(false);

  const [insumo, setInsumo] = useState<IInsumos>({
    id: 0,
    material: "",
    unidade: "kg",
    leadTimeEntrega: 0,
    custoMedio: 0,
  });

  const maquinas = [];

  return (
    <div className="w-full bg-white rounded-md shadow p-4 overflow-auto">
      <Modal.Root isVisible={novoInsumo && maquinas.length < 10}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Novo Insumo"
            onClose={() => setNovoInsumo(false)}
          />
          <FormNovoInsumo
            setInsumo={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "insumos"],
              })
            }
            setNovoInsumo={setNovoInsumo}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={editarInsumo}>
        <Modal.Container>
          <Modal.Header
            title="Editar Insumo"
            onClose={() => setEditarInsumo(false)}
          />
          <FormEditarInsumo
            setInsumo={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "insumos"],
              })
            }
            setEditarInsumo={setEditarInsumo}
            insumo={insumo}
          />
        </Modal.Container>
      </Modal.Root>
      <h1 className="text-xl text-[#5B85D5] font-bold">
        Cadastrar matéria prima
      </h1>
      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[470px] overflow-x-auto">
        <table className="w-full overflow-x-auto overflow-y-auto">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Material
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Un
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Lead Time Médio de Entrega (dias)
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Custo Médio (R$/Kg)
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
              <td className="px-6 py-4 text-right">
                <div className="w-full flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditarInsumo(true);
                      setInsumo(insumo);
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
            setNovoInsumo(true);
            setInsumo({
              id: 0,
              material: "",
              unidade: "kg",
              leadTimeEntrega: 0,
              custoMedio: 0,
            });
          }}
          className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <CiCirclePlus className="w-4 h-4 md:h-6 md:w-6 mr-2" />
          Adicionar Nova Matéria Prima
        </button>
      </div>
    </div>
  );
}

export default Insumos;
