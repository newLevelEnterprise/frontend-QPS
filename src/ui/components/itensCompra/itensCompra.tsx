import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { toast } from "react-toastify";
import type { IItensCompra } from "../../../types/ItensCompra";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";
import FormEditarItem from "./formEditarItem";
import FormNovoItem from "./formNovoItem";

function ItensCompras() {
  const queryClient = useQueryClient();
  const [novoItem, setNovoItem] = useState<boolean>(false);
  const [editarItem, setEditarItem] = useState<boolean>(false);

  const [item, setItem] = useState<IItensCompra>({
    id: 0,
    name: "",
    lead_time: 0,
    cost: 0,
    scrap: 0,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/purchase-items/${id}`);
    },
    onError: (error) => {
      console.error("Erro ao deletar item:", error);
      toast.error("Erro ao deletar item. Por favor, tente novamente.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get", "all", "itens_compra"],
      });
    },
  });

  const { data: itensCompra, isFetching } = useQuery({
    queryKey: ["get", "all", "itens_compra"],
    queryFn: async () => {
      const { data } = await apiClient.get<IItensCompra[]>("/purchase-items/");
      return data;
    },
  });

  return (
    <div className="w-full bg-white rounded-md shadow p-4 overflow-auto">
      <Modal.Root isVisible={novoItem}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Novo Item"
            onClose={() => setNovoItem(false)}
          />
          <FormNovoItem
            setItem={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "itens_compra"],
              })
            }
            setNovoItem={setNovoItem}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={editarItem}>
        <Modal.Container>
          <Modal.Header
            title="Editar Item"
            onClose={() => setEditarItem(false)}
          />
          <FormEditarItem
            setItem={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "itens_compra"],
              })
            }
            setEditarItem={setEditarItem}
            item={item}
          />
        </Modal.Container>
      </Modal.Root>
      <h1 className="text-xl text-[#5B85D5] font-bold">Itens de Compra</h1>
      {isFetching && <Loader message="Carregando itens de compra" />}
      {!isFetching && (
        <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-fit max-h-[470px] overflow-x-auto">
          <table className="w-full overflow-auto max-h-[470px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Material
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Lead Time Médio de Entrega (dias)
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Custo Médio (R$/Kg)
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Refugo
                </th>
                <th className="px-6 py-4 text-right text-xs md:text-sm font-medium text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {itensCompra?.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {item.lead_time}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {item.cost}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {item.scrap}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="w-full flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditarItem(true);
                          setItem(item);
                        }}
                        className="text-blue-600 cursor-pointer hover:text-blue-800 text-xs md:text-sm font-medium transition-colors duration-150"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => mutateAsync(item.id)}
                        disabled={isPending || isFetching}
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
      {!isFetching && (
        <div className="flex flex-col gap-4 items-center justify-center mt-4">
          <button
            onClick={() => {
              setNovoItem(true);
              setItem({
                id: 0,
                name: "",
                lead_time: 0,
                cost: 0,
                scrap: 0,
              });
            }}
            className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <CiCirclePlus className="w-4 h-4 md:h-6 md:w-6 mr-2" />
            Adicionar Novo Item
          </button>
        </div>
      )}
    </div>
  );
}

export default ItensCompras;
