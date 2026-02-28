import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { toast } from "react-toastify";
import type { IMoldes } from "../../../types/Moldes";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";
import FormEditarMolde from "./formEditarMolde";
import FormNovoMolde from "./formNovoMolde";

function Moldes() {
  const queryClient = useQueryClient();
  const [novoMolde, setNovoMolde] = useState<boolean>(false);
  const [editarMolde, setEditarMolde] = useState<boolean>(false);

  const [molde, setMolde] = useState<IMoldes>({
    id: 0,
    closed_cavity_risk: 0,
    name: "",
    open_cavities: 0,
    products: [],
    scrap: 0,
    total_cavities: 0,
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/molds/${id}`);
    },
    onError: (error) => {
      toast.error("Erro ao deletar molde. Tente novamente.");
      console.error("Erro ao deletar molde:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get", "all", "moldes"],
      });
      toast.success("Molde deletado com sucesso!");
    },
  });

  const { data: moldes, isFetching } = useQuery({
    queryKey: ["get", "all", "moldes"],
    queryFn: async () => {
      const { data } = await apiClient.get<IMoldes[]>("/molds/");
      return data;
    },
  });
  console.log(moldes);
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
      {isFetching && <Loader message="Carregando moldes" />}
      {!isFetching && (
        <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-fit max-h-[470px] overflow-x-auto">
          <table className="w-full overflow-auto max-h-[470px]">
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
              {moldes?.map((molde) => (
                <tr
                  key={molde.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {molde.name}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {molde.products.map((product) => product.name).join(", ")}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {molde.total_cavities}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {molde.open_cavities}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {molde.scrap}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {molde.closed_cavity_risk}
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
                        onClick={() => mutateAsync(molde.id)}
                        className="text-red-500 cursor-pointer hover:text-red-700 text-xs md:text-sm font-medium transition-colors duration-150"
                      >
                        Excluir
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
          disabled={isFetching}
          onClick={() => {
            setNovoMolde(true);
            setMolde({
              id: 0,
              closed_cavity_risk: 0,
              name: "",
              open_cavities: 0,
              products: [],
              scrap: 0,
              total_cavities: 0,
            });
          }}
          className="disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <CiCirclePlus className="w-4 h-4 md:h-6 md:w-6 mr-2" />
          Adicionar Novo Molde
        </button>
      </div>
    </div>
  );
}

export default Moldes;
