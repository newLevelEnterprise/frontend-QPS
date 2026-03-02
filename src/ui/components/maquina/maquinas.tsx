import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { useParams } from "react-router-dom";
import type { ICompositionLine, IMaquinas } from "../../../types/Maquina";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";
import FormEditarMaquina from "./formEditarMaquina";
import FormNovaMaquina from "./formNovaMaquina";

type IEditMaquinaState = IMaquinas & {
  linhaId?: string | number;
  mold_id?: number;
  product_id?: number;
  product_name?: string;
  post_injection_cycle_time?: number | string;
  machines?: ICompositionLine["machines"];
};

function Maquina() {
  const { linhaId } = useParams();
  const queryClient = useQueryClient();
  const [novaMaquina, setNovaMaquina] = useState<boolean>(false);
  const [editarMaquina, setEditarMaquina] = useState<boolean>(false);

  const { data: linhaProd, isFetching } = useQuery({
    queryKey: ["get", "all", "linhaprod", linhaId],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        name: string;
        id: number;
        composition_lines: ICompositionLine[];
      }>(`/production-lines/${linhaId}`);
      return data;
    },
  });

  const [maquina, setMaquina] = useState<IEditMaquinaState>({
    id: 0,
    name: "",
    disponibilidade: 0,
    codMolde: "",
    produto: "",
  });

  console.log("linhaProd", linhaProd);
  return (
    <div className="w-full bg-white rounded-md shadow p-4 overflow-auto">
      <Modal.Root
        isVisible={
          novaMaquina && (linhaProd?.composition_lines.length ?? 0) < 10
        }
      >
        <Modal.Container>
          <Modal.Header
            title="Adicionar Nova Máquina"
            onClose={() => setNovaMaquina(false)}
          />
          <FormNovaMaquina
            linhaId={linhaId}
            setMaquina={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "linhaprod", linhaId],
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
                queryKey: ["get", "all", "linhaprod", linhaId],
              })
            }
            setEditarMaquina={setEditarMaquina}
            maquina={maquina}
          />
        </Modal.Container>
      </Modal.Root>
      {isFetching && (
        <Loader message="Carregando a sua linha de Produção ..." />
      )}
      {!isFetching && !linhaProd && (
        <div>
          <h1>Linha de Produção não encontrada</h1>
        </div>
      )}
      {!isFetching && (
        <>
          <h1 className="text-xl text-[#5B85D5] font-bold">
            {linhaProd?.name}
          </h1>
          <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-fit max-h-[470px] overflow-x-auto">
            <table className="w-full overflow-auto max-h-[470px]">
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
                {linhaProd?.composition_lines.map((cp) => (
                  <tr
                    key={cp.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                      {cp.mold_name}
                    </td>
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                      {cp.product_name}
                    </td>
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                      {cp.mold.total_cavities}
                    </td>
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                      {cp.mold.open_cavities}
                    </td>
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                      {/* {cp.post_injection_cycle_time} */}
                      teste
                    </td>
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                      {cp.mold.scrap}
                    </td>
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                      {cp.mold.closed_cavity_risk}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="w-full flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditarMaquina(true);
                            setMaquina({
                              id: cp.id,
                              name: cp.product_name,
                              disponibilidade:
                                cp.machines?.[0]?.availability ?? 0,
                              codMolde: String(cp.mold_id),
                              produto:
                                cp.product_id != null
                                  ? String(cp.product_id)
                                  : cp.product_name,
                              linhaId,
                              mold_id: cp.mold_id,
                              product_id: cp.product_id,
                              product_name: cp.product_name,
                              post_injection_cycle_time:
                                cp.post_injection_cycle_time,
                              machines: cp.machines,
                            });
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
                ))}
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
                  codMolde: "",
                  produto: "",
                });
              }}
              className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <CiCirclePlus className="w-4 h-4 md:h-6 md:w-6 mr-2" />
              Adicionar Nova Linha
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Maquina;
