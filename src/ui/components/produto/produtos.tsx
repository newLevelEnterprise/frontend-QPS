import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { IoSearchSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import type { IProduto } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";
import FormEditarProduto from "./formEditProduto";
import FormNovoProduto from "./formNovoProduto";

function Produtos() {
  const queryClient = useQueryClient();
  const [novoProduto, setNovoProduto] = useState<boolean>(false);
  const [editarProduto, setEditarProduto] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>("");

  const [produto, setProduto] = useState<IProduto>({
    id: 0,
    name: "",
  });

  const deletarProdutoFn = async (productId: number) => {
    try {
      await apiClient.delete(`/products/${productId}`);
      queryClient.setQueryData(
        ["get", "all", "products"],
        (oldData: IProduto[]) => {
          if (!oldData) return oldData;
          return oldData.filter((item) => item.id !== productId);
        },
      );
      toast.success("Produto removido com sucesso!", {
        toastId: "deleteProductToast",
      });
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      toast.error("Erro ao remover produto. Tente novamente.");
    }
  };

  const { data: products, isFetching } = useQuery({
    queryKey: ["get", "all", "products"],
    queryFn: async () => {
      const { data } = await apiClient.get<IProduto[]>("/products/");
      return data;
    },
  });

  return (
    <div className="w-full bg-white rounded-md shadow p-4 overflow-auto">
      <Modal.Root isVisible={novoProduto}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Novo Produto"
            onClose={() => setNovoProduto(false)}
          />
          <FormNovoProduto
            setProducts={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "products"],
              })
            }
            setNovoProduto={setNovoProduto}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={editarProduto}>
        <Modal.Container>
          <Modal.Header
            title="Editar Produto"
            onClose={() => setEditarProduto(false)}
          />
          <FormEditarProduto
            setProducts={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "products"],
              })
            }
            setEditarProduto={setEditarProduto}
            produto={produto}
          />
        </Modal.Container>
      </Modal.Root>
      <h1 className="text-xl text-[#5B85D5] font-bold">Produtos Cadastrados</h1>
      <div className="relative max-w-md mt-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IoSearchSharp className="h-4 w-4 text-gray-400" />
        </div>
        <input
          disabled={!products || products.length === 0}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          type="text"
          placeholder="Buscar..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-fit max-h-[470px] overflow-x-auto">
        {isFetching ? (
          <Loader message="Carregando produtos" />
        ) : !products || products.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <h2 className="text-lg md:text-2xl text-gray-500 font-semibold">
              Nenhum produto encontrado !
            </h2>
          </div>
        ) : (
          <table className="w-full overflow-auto max-h-[470px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Produto
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Estrutura
                </th>
                <th className="px-6 py-4 text-right text-xs md:text-sm font-medium text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((item) =>
                  item.name.toLowerCase().includes(busca.toLowerCase()),
                )
                .map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-600">
                      {item.is_simple === false
                        ? (item.structure_components || [])
                            .map((component) => `${component.name} × ${component.quantity}`)
                            .join(", ")
                        : "Produto simples"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="w-full flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditarProduto(true);
                            setProduto(item);
                          }}
                          className="text-blue-600 cursor-pointer hover:text-blue-800 text-xs md:text-sm font-medium transition-colors duration-150"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deletarProdutoFn(item.id)}
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
        )}
      </div>

      <div className="flex justify-center mt-4 ">
        <button
          onClick={() => {
            setNovoProduto(true);
            setProduto({
              id: 0,
              name: "",
            });
          }}
          className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <CiCirclePlus className="w-4 h-4 md:h-6 md:w-6 mr-2" />
          Adicionar Novo Produto
        </button>
      </div>
    </div>
  );
}

export default Produtos;
