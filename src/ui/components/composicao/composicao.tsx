import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { toast } from "react-toastify";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";
import type { EditarComposicaoFormState } from "./formEditarComposicao";
import FormEditComposicao from "./formEditarComposicao";
import FormNovaComposicao, {
  type NovaComposicaoFormState,
} from "./formNovaComposicao";

interface ProductComposition {
  id: number;
  produto_id: number;
  raw_materials: {
    id: number;
    quantity: string;
    nome: string;
  }[];
  purchase_items: {
    id: number;
    quantity: string;
    name: string;
  }[];
}

function Composicao() {
  const queryClient = useQueryClient();
  const [novaComposicaoAberta, setNovaComposicaoAberta] =
    useState<boolean>(false);
  const [edicaoComposicaoAberta, setEdicaoComposicaoAberta] =
    useState<boolean>(false);
  const [composicaoSelecionadaId, setComposicaoSelecionadaId] =
    useState<number>(0);

  const { data: composicoes, isFetching } = useQuery({
    queryKey: ["get", "all", "product-composition"],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductComposition[]>(
        "/product-composition/",
      );
      return data;
    },
  });

  const { mutateAsync: deleteComposicao, isPending: isDeletingComposicao } =
    useMutation({
      mutationFn: async (compositionId: number) => {
        await apiClient.delete(`/product-composition/${compositionId}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["get", "all", "product-composition"],
        });
        toast.success("Composição deletada com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao deletar composição. Tente novamente.");
      },
    });

  const { mutateAsync: criarComposicao, isPending: isCreatingComposicao } =
    useMutation({
      mutationFn: async (data: NovaComposicaoFormState) => {
        await apiClient.post("/product-composition", {
          produto_id: data.productId,
          raw_materials: data.rawMaterials.map((rawMaterial) => ({
            id: rawMaterial.id,
            quantity: rawMaterial.quantity,
          })),
          purchase_items: data.purchaseItems.map((purchaseItem) => ({
            id: purchaseItem.id,
            quantity: purchaseItem.quantity,
          })),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["get", "all", "product-composition"],
        });
        toast.success("Composição criada com sucesso!");
        setNovaComposicaoAberta(false);
      },
      onError: () => {
        toast.error("Erro ao criar composição. Tente novamente.");
      },
    });

  const { mutateAsync: editarComposicao, isPending: isEditingComposicao } =
    useMutation({
      mutationFn: async (data: EditarComposicaoFormState) => {
        await apiClient.put(`/product-composition/${data.id}`, {
          produto_id: data.productId,
          raw_materials: data.rawMaterials.map((rawMaterial) => ({
            id: rawMaterial.id,
            quantity: rawMaterial.quantity,
          })),
          purchase_items: data.purchaseItems.map((purchaseItem) => ({
            id: purchaseItem.id,
            quantity: purchaseItem.quantity,
          })),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["get", "all", "product-composition"],
        });
        toast.success("Composição editada com sucesso!");
        setEdicaoComposicaoAberta(false);
      },
      onError: () => {
        toast.error("Erro ao editar composição. Tente novamente.");
      },
    });

  const getCompositionId = (composicao: ProductComposition) => composicao.id;

  const rawMaterialColumns = useMemo(() => {
    const rawMaterialsMap = new Map<number, string>();

    composicoes?.forEach((composicao) => {
      composicao.raw_materials.forEach((rawMaterial) => {
        if (!rawMaterialsMap.has(rawMaterial.id)) {
          rawMaterialsMap.set(rawMaterial.id, rawMaterial.nome);
        }
      });
    });

    return Array.from(rawMaterialsMap.entries()).map(([id, nome]) => ({
      id,
      nome,
    }));
  }, [composicoes]);

  const purchaseItemColumns = useMemo(() => {
    const purchaseItemsMap = new Map<number, string>();

    composicoes?.forEach((composicao) => {
      composicao.purchase_items.forEach((purchaseItem) => {
        if (!purchaseItemsMap.has(purchaseItem.id)) {
          purchaseItemsMap.set(purchaseItem.id, purchaseItem.name);
        }
      });
    });

    return Array.from(purchaseItemsMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [composicoes]);

  return (
    <div className="w-full bg-white rounded-md shadow p-4 overflow-auto">
      <Modal.Root isVisible={novaComposicaoAberta}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Nova composição"
            onClose={() => setNovaComposicaoAberta(false)}
          />
          <FormNovaComposicao
            isSubmitting={isCreatingComposicao}
            onSubmit={(formsState) => criarComposicao(formsState)}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={edicaoComposicaoAberta}>
        <Modal.Container>
          <Modal.Header
            title="Editar composição"
            onClose={() => setEdicaoComposicaoAberta(false)}
          />
          <FormEditComposicao
            compositionId={composicaoSelecionadaId}
            isSubmitting={isEditingComposicao}
            onSubmit={(formsState) => editarComposicao(formsState)}
          />
        </Modal.Container>
      </Modal.Root>
      <h1 className="text-xl text-[#5B85D5] font-bold">Composições</h1>
      {isFetching && <Loader message="Carregando composições" />}
      {!isFetching && (
        <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-fit max-h-[470px] overflow-x-auto">
          <table className="w-full overflow-auto max-h-[470px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Produto (ID)
                </th>
                {rawMaterialColumns.map((rawMaterialColumn) => (
                  <th
                    key={`raw-material-column-${rawMaterialColumn.id}`}
                    className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700"
                  >
                    {rawMaterialColumn.nome}
                  </th>
                ))}
                {purchaseItemColumns.map((purchaseItemColumn) => (
                  <th
                    key={`purchase-item-column-${purchaseItemColumn.id}`}
                    className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700"
                  >
                    {purchaseItemColumn.name}
                  </th>
                ))}
                <th className="px-6 py-4 text-right text-xs md:text-sm font-medium text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {composicoes?.map((composicao) => (
                <tr
                  key={getCompositionId(composicao) ?? composicao.produto_id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {composicao.produto_id}
                  </td>
                  {rawMaterialColumns.map((rawMaterialColumn) => {
                    const rawMaterial = composicao.raw_materials.find(
                      (item) => item.id === rawMaterialColumn.id,
                    );

                    return (
                      <td
                        key={`raw-material-value-${composicao.produto_id}-${rawMaterialColumn.id}`}
                        className="px-6 py-4 text-xs md:text-sm text-gray-900"
                      >
                        {rawMaterial?.quantity ?? "-"}
                      </td>
                    );
                  })}
                  {purchaseItemColumns.map((purchaseItemColumn) => {
                    const purchaseItem = composicao.purchase_items.find(
                      (item) => item.id === purchaseItemColumn.id,
                    );

                    return (
                      <td
                        key={`purchase-item-value-${composicao.produto_id}-${purchaseItemColumn.id}`}
                        className="px-6 py-4 text-xs md:text-sm text-gray-900"
                      >
                        {purchaseItem?.quantity ?? "-"}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-right">
                    <div className="w-full flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setComposicaoSelecionadaId(composicao.produto_id);
                          setEdicaoComposicaoAberta(true);
                        }}
                        className="text-blue-600 cursor-pointer hover:text-blue-800 text-xs md:text-sm font-medium transition-colors duration-150"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          const compositionId = getCompositionId(composicao);
                          if (!compositionId) {
                            toast.error(
                              "ID da composição não encontrado para deletar.",
                            );
                            return;
                          }

                          deleteComposicao(compositionId);
                        }}
                        disabled={
                          isDeletingComposicao || !getCompositionId(composicao)
                        }
                        className="text-red-500 cursor-pointer hover:text-red-700 text-xs md:text-sm font-medium transition-colors duration-150 disabled:opacity-50"
                      >
                        Deletar
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
          onClick={() => setNovaComposicaoAberta(true)}
          className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <CiCirclePlus className="w-4 h-4 md:h-6 md:w-6 mr-2" />
          Adicionar Nova Composição
        </button>
      </div>
    </div>
  );
}

export default Composicao;
