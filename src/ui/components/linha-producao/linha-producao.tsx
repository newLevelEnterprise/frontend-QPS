import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { toast } from "react-toastify";
import type { ILinhasProducao } from "../../../types/LinhaProducao";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";
import FormEditarLinha from "./formEditarLinha";
import FormNovaLinha from "./formNovaLinha";

function LinhaProducao() {
  const queryClient = useQueryClient();
  const [novaLinha, setNovaLinha] = useState<boolean>(false);
  const [editarLinha, setEditarLinha] = useState<boolean>(false);

  const [linhaProd, setLinhaProd] = useState<ILinhasProducao>({
    id: 0,
    name: "",
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/production-lines/${id}`);
    },
    onError: (error) => {
      toast.error("Erro ao deletar linha. Tente novamente.");
      console.error("Erro ao deletar linha:", error);
    },
  });

  const { data: linhas, isFetching } = useQuery({
    queryKey: ["get", "all", "linhas"],
    queryFn: async () => {
      const { data } =
        await apiClient.get<ILinhasProducao[]>("/production-lines");
      return data;
    },
  });

  return (
    <div className="w-full bg-white rounded-md shadow p-4">
      <Modal.Root isVisible={novaLinha}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Nova Linha"
            onClose={() => setNovaLinha(false)}
          />
          <FormNovaLinha
            setLinha={() =>
              queryClient.invalidateQueries({ queryKey: ["productionLines"] })
            }
            setNovaLinha={setNovaLinha}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={editarLinha}>
        <Modal.Container>
          <Modal.Header
            title="Editar Linha"
            onClose={() => setEditarLinha(false)}
          />
          <FormEditarLinha
            setLinha={() =>
              queryClient.invalidateQueries({ queryKey: ["productionLines"] })
            }
            setEditarLinha={setEditarLinha}
            linha={linhaProd}
          />
        </Modal.Container>
      </Modal.Root>
      <h1 className="text-xl text-[#5B85D5] font-bold">Linhas de Produção</h1>
      {isFetching && <Loader message="Carregando linhas de produção" />}
      {!isFetching && (
        <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-fit max-h-[470px] overflow-x-auto">
          <table className="w-full overflow-auto max-h-[470px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Nome
                </th>
                <th className="px-6 py-4 text-right text-xs md:text-sm font-medium text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {linhas?.map((linha) => (
                <tr
                  key={linha.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {linha.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="w-full flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setLinhaProd(linha);
                          setEditarLinha(true);
                        }}
                        className="text-blue-600 cursor-pointer hover:text-blue-800 text-xs md:text-sm font-medium transition-colors duration-150"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => mutateAsync(linha.id)}
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
      {!isFetching && (
        <div className="flex flex-col gap-4 items-center justify-center mt-4">
          <button
            disabled={isFetching}
            onClick={() => {
              setNovaLinha(true);
              setLinhaProd({
                id: 0,
                name: "",
              });
            }}
            className="disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <CiCirclePlus className="w-4 h-4 md:h-6 md:w-6 mr-2" />
            Adicionar Nova Linha
          </button>
        </div>
      )}
    </div>
  );
}

export default LinhaProducao;
