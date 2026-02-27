import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { toast } from "react-toastify";
import type { IMaquinasType } from "../../../types/Maquina";
import { apiClient } from "../../../utils/apiClient";
import Modal from "../modal";
import FormEditarMaquina from "./formEditarMaquina";
import FormNovaMaquina from "./formNovaMaquina";

function Maquinas() {
  const queryClient = useQueryClient();
  const [novaMaquina, setNovaMaquina] = useState<boolean>(false);
  const [editarMaquina, setEditarMaquina] = useState<boolean>(false);

  const [maquina, setMaquina] = useState<IMaquinasType>({
    name: "",
    availability: 0,
    id: 0,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/machines/${id}`);
    },
    onError: (error) => {
      toast.error("Erro ao deletar máquina. Tente novamente.");
      console.error("Erro ao deletar máquina:", error);
    },
  });

  const { data: maquinas, isFetching } = useQuery({
    queryKey: ["get", "all", "maquinas"],
    queryFn: async () => {
      const { data } = await apiClient.get<IMaquinasType[]>("/machines");
      return data;
    },
  });

  return (
    <div className="w-full bg-white rounded-md shadow p-4 overflow-auto">
      <Modal.Root
        isVisible={novaMaquina && !!maquinas && maquinas?.length < 10}
      >
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
      <h1 className="text-xl text-[#5B85D5] font-bold">Máquinas Cadastradas</h1>
      {isFetching && (
        <div className="w-full flex items-center justify-center mt-6">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Carregando máquinas...</p>
          </div>
        </div>
      )}
      {!isFetching && (
        <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-fit max-h-[470px] overflow-x-auto">
          <table className="w-full overflow-auto max-h-[470px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Máquina
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Disponibilidade
                </th>
                <th className="px-6 py-4 text-right text-xs md:text-sm font-medium text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {maquinas?.map((maq) => (
                <tr
                  key={maq.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {maq.name}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {maq.availability}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="w-full flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditarMaquina(true);
                          setMaquina(maq);
                        }}
                        className="text-blue-600 cursor-pointer hover:text-blue-800 text-xs md:text-sm font-medium transition-colors duration-150"
                      >
                        Editar
                      </button>
                      <button
                        disabled={isPending}
                        onClick={() => mutateAsync(maq.id)}
                        className="text-red-500 cursor-pointer hover:text-red-700 text-xs md:text-sm font-medium transition-colors duration-150"
                      >
                        {isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          "Excluir"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-col gap-4 items-center justify-center mt-4">
        <button
          onClick={() => {
            setNovaMaquina(true);
            setMaquina({
              name: "",
              availability: 0,
              id: 0,
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

export default Maquinas;
