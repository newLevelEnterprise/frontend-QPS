import { useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { IoSearchSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import type { IProduto } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Modal from "../modal";
import FormEditarProduto from "./formEditProduto";
import FormNovoProduto from "./formNovoProduto";
import FormSetup from "./formSetup";

function Produtos() {
  const [novoProduto, setNovoProduto] = useState<boolean>(false);
  const [editarProduto, setEditarProduto] = useState<boolean>(false);
  const [products, setProducts] = useState<IProduto[]>([]);
  const [busca, setBusca] = useState<string>("");
  const [buscaSetup, setBuscaSetup] = useState<string>("");
  const [setup, setSetup] = useState<{nome: string; id: number} | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [produto, setProduto] = useState<
    Pick<IProduto, "id" | "name" | "cycle" | 'scrap' | 'bottleneck'>
  >({
    id: 0,
    name: "",
    cycle: 0,
    scrap: 0,
    bottleneck: 0
  });

  const [produtoListaFiltrada, setProdutoListaFiltrada] =
    useState<IProduto[]>([]);


  const deletarProdutoFn = async (produtoId: number) => {
    try {
      await apiClient.delete(`/products/${produtoId}`);
      setProdutoListaFiltrada((prev) => prev.filter((p) => p.id !== produtoId));
      toast.success("Produto removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      toast.error("Erro ao remover produto. Tente novamente.");
    } 
  };

  useEffect(() => {
    const getProducts = async () => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.get<IProduto[]>("/products");
        setProdutoListaFiltrada(data);
        setProducts(data);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, []);

  useEffect(() => {
    setProdutoListaFiltrada(products.filter((p) => p.name.includes(busca)));
  }, [busca]);

  return (
    <div className="w-full bg-white rounded-md shadow p-4">
      {/* Modal para o produto */}
      <Modal.Root isVisible={novoProduto}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Novo Produto"
            onClose={() =>
             setNovoProduto(false)
            }
          />
          <FormNovoProduto setNovoProduto={setNovoProduto} setProducts={setProdutoListaFiltrada} />
        </Modal.Container>
      </Modal.Root>

        <Modal.Root isVisible={editarProduto}>
        <Modal.Container>
          <Modal.Header
            title="Editar Produto"
            onClose={() =>
              setEditarProduto(false)
            }
          />
          <FormEditarProduto setProducts={setProdutoListaFiltrada} produto={produto} setEditarProduto={setEditarProduto} />
        </Modal.Container>
      </Modal.Root>

      {/* Modal para o Setup */}
      <Modal.Root isVisible={!!setup}>
        <Modal.Container>
          <Modal.Header
            title={setup?.nome || ''}
            onClose={() => setSetup(null)}
          />
          <div className="relative max-w-md mt-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchSharp className="h-4 w-4 text-gray-400" />
            </div>
            <input
              value={''}
              onChange={(e) => setBuscaSetup(e.target.value)}
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <FormSetup
            onClose={setSetup}
            produto_ref={setup?.id || 0}
            produtos={products.filter(p => p.name !== setup?.nome).filter(p => p.name === buscaSetup).map(p => ({
              ciclo: p.cycle,
              id: p.id,
              nomeProdutoDestino: p.name,
              produto_para: p.id,
              tempo_setup: 0
            }))}
          />
        </Modal.Container>
      </Modal.Root>

      {/* Listagem dos produtos */}
      <h1 className="text-xl text-[#5B85D5] font-bold">Produtos Cadastrados</h1>
      <div className="relative max-w-md mt-4">
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

      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[470px]">
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">Carregando produtos...</p>
            </div>
          </div>
        ) : produtoListaFiltrada.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <h2 className="text-lg md:text-2xl text-gray-500 font-semibold">
              Nenhum produto encontrado !
            </h2>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Produto
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Ciclo
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Tempo Restante de Processamento
                </th>
                 <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Refugo
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {produtoListaFiltrada.map((produto) => (
                <tr
                  key={produto.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {produto.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {produto.cycle}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {produto.bottleneck}
                  </td>
                   <td className="px-6 py-4 text-sm text-gray-900">
                    {produto.scrap}
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
                        onClick={() => setSetup({nome: produto.name, id: produto.id})}
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
