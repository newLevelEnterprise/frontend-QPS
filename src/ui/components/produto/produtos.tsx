import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { IoSearchSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import type { IProduto } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Modal from "../modal";
import XlsxUpload from "../XlsxUpload";
import FormEditarProduto from "./formEditProduto";
import FormNovoProduto from "./formNovoProduto";
import FormSetup from "./formSetup";

function Produtos() {
  const [novoProduto, setNovoProduto] = useState<boolean>(false);
  const [editarProduto, setEditarProduto] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>("");
  const [setup, setSetup] = useState<{ nome: string; id: number } | null>(null);
  const [uploadSetup, setUploadSetup] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const [produto, setProduto] = useState<
    Pick<IProduto, "id" | "name" | "cycle" | "scrap" | "bottleneck">
  >({
    id: 0,
    name: "",
    cycle: 0,
    scrap: 0,
    bottleneck: 0,
  });

  const deletarProdutoFn = async (produtoId: number) => {
    try {
      await apiClient.delete(`/products/${produtoId}`);

      queryClient.setQueryData(
        ["get", "all", "products"],
        (oldData: IProduto[]) => {
          if (!oldData) return oldData;
          return oldData.filter((client) => client.id !== produtoId);
        }
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
    <div className="w-full bg-white rounded-md shadow p-4">
      {/* Modal para o produto */}
      <Modal.Root isVisible={novoProduto}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Novo Produto"
            onClose={() => setNovoProduto(false)}
          />
          <FormNovoProduto
            setNovoProduto={setNovoProduto}
            setProducts={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "products"],
              })
            }
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
            produto={produto}
            setEditarProduto={setEditarProduto}
          />
        </Modal.Container>
      </Modal.Root>

      {/* Modal para o Setup */}
      <Modal.Root isVisible={!!setup}>
        <Modal.Container>
          <Modal.Header
            title={setup?.nome || ""}
            onClose={() => setSetup(null)}
          />
          <FormSetup onClose={setSetup} produto_ref={setup?.id || 0} />
        </Modal.Container>
      </Modal.Root>

            {/* Modal para o Setup */}
      <Modal.Root isVisible={uploadSetup}>
        <Modal.Container className="md:w-1/2">
          <Modal.Header
            title='Upload Setup'
            onClose={() => setUploadSetup(prev => !prev)}
          />
          <XlsxUpload mainDivClassName="mt-4 shadow-none" uploaderContainerClassName="lg:w-full" endpoint="setup-matrix-xlsx" cachekey={["get", "all", "products"]}/>
        </Modal.Container>
      </Modal.Root>

      {/* Listagem dos produtos */}
      <h1 className="text-xl text-[#5B85D5] font-bold">Produtos Cadastrados</h1>
      <div className="w-full flex flex-col gap-4 md:flex-row justify-between items-end">
        <div className="flex-1 relative w-full md:max-w-md mt-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearchSharp className="h-4 w-4 text-gray-400" />
          </div>
          <input
            onChange={(e) => setBusca(e.target.value)}
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="space-x-10">
          <button onClick={() => setUploadSetup(prev => !prev)} className="px-4 py-1 bg-blue-300 hover:bg-blue-400 transition-colors duration-150 cursor-pointer text-white rounded-md">Upload setup</button>

          <a target="_top" href="https://api-quant-production.up.railway.app/template/setup-matrix" download>
            <button className="px-4 py-1 bg-blue-300 hover:bg-blue-400 transition-colors duration-150 cursor-pointer text-white rounded-md">
              Download setup
            </button>
          </a>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[470px] overflow-x-auto">
        {isFetching ? (
          <div className="w-full h-full flex justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">
                Carregando produtos...
              </p>
            </div>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <h2 className="text-lg md:text-2xl text-gray-500 font-semibold">
              Nenhum produto encontrado !
            </h2>
          </div>
        ) : (
          <table className="w-full overflow-x-auto">
            <thead className="overflow-x-auto">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Produto
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Ciclo (Seg/ç)
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Tempo Restante de Processamento
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Refugo (em %)
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="overflow-x-auto">
              {products
                .filter((p) => p.name.includes(busca))
                .map((produto) => (
                  <tr
                    key={produto.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {produto.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {produto.cycle}
                      <span className="text-[10px] ml-1">(Seg/ç)</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {produto.bottleneck}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {produto.scrap}
                      <span className="text-[10px] ml-1">%</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="w-full flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setProduto(produto);
                            setEditarProduto(true);
                          }}
                          className="text-blue-600 cursor-pointer hover:text-blue-800 text-sm font-medium transition-colors duration-150"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            setSetup({ nome: produto.name, id: produto.id })
                          }
                          className="text-blue-600 cursor-pointer hover:text-blue-800 text-sm font-medium transition-colors duration-150"
                        >
                          Setup
                        </button>
                        <button
                          onClick={() => deletarProdutoFn(produto.id)}
                          className="text-red-500 cursor-pointer hover:text-red-700 text-sm font-medium transition-colors duration-150"
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
