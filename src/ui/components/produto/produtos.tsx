import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { IoSearchSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import type { IProduto } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";
import FormEditarProduto from "./formEditProduto";
import FormNovoProduto from "./formNovoProduto";

function isCompound(product: IProduto) {
  return product.is_simple === false;
}

function componentCountLabel(count: number) {
  return count === 1 ? "1 componente" : `${count} componentes`;
}

function quantityLabel(quantity: number) {
  return quantity === 1 ? "1 unidade" : `${quantity} unidades`;
}

function commercialLabels(products: IProduto[]) {
  const componentIds = new Set<number>();
  for (const product of products) {
    for (const part of product.structure_components ?? []) {
      if (part.id !== product.id) {
        componentIds.add(part.id);
      }
    }
  }
  return products.filter((product) => !componentIds.has(product.id));
}

function Produtos() {
  const queryClient = useQueryClient();
  const [novoProduto, setNovoProduto] = useState<boolean>(false);
  const [editarProduto, setEditarProduto] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>("");
  const [composicaoAbertaId, setComposicaoAbertaId] = useState<number | null>(
    null,
  );

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

  const labels = commercialLabels(products ?? []).filter((item) => {
    const term = busca.trim().toLowerCase();
    if (!term) {
      return true;
    }
    const componentIds = (item.structure_components ?? []).map(
      (component) => component.external_id ?? "",
    );
    return (
      item.name.toLowerCase().includes(term) ||
      (item.external_id ?? "").toLowerCase().includes(term) ||
      componentIds.some((id) => id.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md bg-white p-4 shadow">
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
          disabled={commercialLabels(products ?? []).length === 0}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          type="text"
          placeholder="Buscar..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mt-2 min-h-0 flex-1 overflow-auto rounded-lg border border-gray-200 shadow-sm">
        {isFetching ? (
          <Loader message="Carregando produtos" />
        ) : labels.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <h2 className="text-lg md:text-2xl text-gray-500 font-semibold">
              Nenhum produto encontrado !
            </h2>
          </div>
        ) : (
          <table className="w-full table-fixed border-separate border-spacing-0">
            <colgroup>
              <col className="w-[12%]" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
              <col className="w-[24%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead>
              <tr>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 text-left text-xs font-medium text-gray-700 md:text-sm">
                  ID
                </th>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 text-left text-xs font-medium text-gray-700 md:text-sm">
                  Produto
                </th>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-white py-4 pl-9 pr-6 text-left text-xs font-medium text-gray-700 md:text-sm">
                  Tipo
                </th>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 text-left text-xs font-medium text-gray-700 md:text-sm">
                  Composição
                </th>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 text-left text-xs font-medium text-gray-700 md:text-sm">
                  Pós-injeção (s)
                </th>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 text-right text-xs font-medium text-gray-700 md:text-sm">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {labels.map((item) => {
                const composto = isCompound(item);
                const componentes = item.structure_components ?? [];
                const composicaoAberta = composicaoAbertaId === item.id;

                return (
                  <Fragment key={item.id}>
                    <tr className="[&>td]:border-b [&>td]:border-gray-200 last:[&>td]:border-b-0">
                      <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                        <span className="block truncate" title={item.external_id || undefined}>
                          {item.external_id || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                        <span className="block truncate" title={item.name}>
                          {item.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left text-xs md:text-sm">
                        <span
                          className={
                            composto
                              ? "inline-flex items-center rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 md:text-sm"
                              : "inline-flex items-center rounded-full bg-green-50 px-3 py-0.5 text-xs font-semibold text-green-700 md:text-sm"
                          }
                        >
                          {composto ? "Composto" : "Simples"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs md:text-sm text-gray-600">
                        {composto ? (
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="shrink-0 font-medium text-gray-900">
                              {componentCountLabel(componentes.length)}
                            </span>
                            <button
                              type="button"
                              aria-expanded={composicaoAberta}
                              onClick={() =>
                                setComposicaoAbertaId(
                                  composicaoAberta ? null : item.id,
                                )
                              }
                              className="cursor-pointer whitespace-nowrap text-xs font-medium text-blue-600 transition-colors duration-150 hover:text-blue-800 md:text-sm"
                            >
                              {composicaoAberta
                                ? "Ocultar composição"
                                : "Ver composição"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">Produto simples</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                        {item.post_injection_cycle_time ?? 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex w-full justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditarProduto(true);
                              setProduto(item);
                            }}
                            className="cursor-pointer text-xs font-medium text-blue-600 transition-colors duration-150 hover:text-blue-800 md:text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deletarProdutoFn(item.id)}
                            className="cursor-pointer text-xs font-medium text-red-500 transition-colors duration-150 hover:text-red-700 md:text-sm"
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                    {composto && composicaoAberta && (
                      <tr className="bg-gray-50 [&>td]:border-b [&>td]:border-gray-200">
                        <td colSpan={6} className="px-6 pb-4">
                          <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
                            <div className="grid grid-cols-[90px_minmax(0,1fr)_130px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                              <div>ID</div>
                              <div>Componente</div>
                              <div>Quantidade</div>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {componentes.map((component) => (
                                <div
                                  key={component.id}
                                  className="grid grid-cols-[90px_minmax(0,1fr)_130px] gap-4 border-b border-gray-100 px-4 py-2.5 text-xs text-gray-800 last:border-b-0 md:text-sm"
                                >
                                  <div className="truncate tabular-nums text-gray-900" title={component.external_id || undefined}>
                                    {component.external_id || "—"}
                                  </div>
                                  <div className="truncate" title={component.name}>
                                    {component.name}
                                  </div>
                                  <div className="tabular-nums text-gray-600">
                                    {quantityLabel(component.quantity)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
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
