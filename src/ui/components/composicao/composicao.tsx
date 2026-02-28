import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";

interface Product {
  id: number;
  name: string;
}

interface RawMaterial {
  id: number;
  nome: string;
}

interface PurchaseItem {
  id: number;
  name: string;
}

interface ProductCompositionForm {
  rawMaterials: Record<number, string>;
  purchaseItems: Record<number, string>;
}

interface ProductCompositionPayload {
  raw_materials: Array<{ id: number; quantity: number }>;
  purchase_items: Array<{ id: number; quantity: number }>;
  produto_id: number;
}

interface ProductCompositionResponseItem {
  produto_id: number;
  raw_materials: Array<{ id: number; quantity: string | number; nome: string }>;
  purchase_items: Array<{
    id: number;
    quantity: string | number;
    name: string;
  }>;
}

const COMPOSITION_ENDPOINT = "/product-composition";

function ComposicaoTable() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compositionsByProduct, setCompositionsByProduct] = useState<
    Record<number, ProductCompositionForm>
  >({});

  const { data: products, isFetching } = useQuery({
    queryKey: ["get", "all", "products"],
    queryFn: async () => {
      const { data } = await apiClient.get<Product[]>("/products/");
      return data;
    },
  });

  const { data: rawMaterials, isFetching: isFetchingRawMaterials } = useQuery({
    queryKey: ["get", "all", "materia-prima"],
    queryFn: async () => {
      const { data } = await apiClient.get<RawMaterial[]>("/raw-material/");
      return data;
    },
  });

  const { data: purchaseItens, isFetching: isFetchingPurchaseItens } = useQuery(
    {
      queryKey: ["get", "all", "purchase-itens"],
      queryFn: async () => {
        const { data } =
          await apiClient.get<PurchaseItem[]>("/purchase-items/");
        return data;
      },
    },
  );

  const {
    data: defaultCompositions,
    isFetching: isFetchingDefaultCompositions,
    isError: isErrorDefaultCompositions,
  } = useQuery({
    queryKey: ["get", "all", "product-composition"],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductCompositionResponseItem[]>(
        `${COMPOSITION_ENDPOINT}/`,
      );
      return data;
    },
  });

  useEffect(() => {
    if (!defaultCompositions?.length) {
      return;
    }

    setCompositionsByProduct((prev) => {
      const normalized = defaultCompositions.reduce<
        Record<number, ProductCompositionForm>
      >((acc, composition) => {
        if (prev[composition.produto_id]) {
          acc[composition.produto_id] = prev[composition.produto_id];
          return acc;
        }

        const rawMaterials = composition.raw_materials.reduce<
          Record<number, string>
        >((rawAcc, item) => {
          rawAcc[item.id] = String(item.quantity ?? "");
          return rawAcc;
        }, {});

        const purchaseItems = composition.purchase_items.reduce<
          Record<number, string>
        >((purchaseAcc, item) => {
          purchaseAcc[item.id] = String(item.quantity ?? "");
          return purchaseAcc;
        }, {});

        acc[composition.produto_id] = {
          rawMaterials,
          purchaseItems,
        };

        return acc;
      }, {});

      return {
        ...prev,
        ...normalized,
      };
    });
  }, [defaultCompositions]);

  useEffect(() => {
    if (isErrorDefaultCompositions) {
      toast.error("Erro ao buscar composições padrão.");
    }
  }, [isErrorDefaultCompositions]);

  const isGettingData =
    isFetching ||
    isFetchingRawMaterials ||
    isFetchingPurchaseItens ||
    isFetchingDefaultCompositions;

  const canSubmit = useMemo(() => {
    return (
      !isGettingData &&
      !isSubmitting &&
      Boolean(products?.length) &&
      (Boolean(rawMaterials?.length) || Boolean(purchaseItens?.length))
    );
  }, [isGettingData, isSubmitting, products, rawMaterials, purchaseItens]);

  const hasDefaultCompositions = Boolean(defaultCompositions?.length);

  const handleQuantityChange = ({
    productId,
    itemId,
    quantity,
    type,
  }: {
    productId: number;
    itemId: number;
    quantity: string;
    type: "rawMaterials" | "purchaseItems";
  }) => {
    setCompositionsByProduct((prev) => {
      const productCurrent = prev[productId] ?? {
        rawMaterials: {},
        purchaseItems: {},
      };

      return {
        ...prev,
        [productId]: {
          ...productCurrent,
          [type]: {
            ...productCurrent[type],
            [itemId]: quantity,
          },
        },
      };
    });
  };

  const getPayloads = (): ProductCompositionPayload[] => {
    if (!products?.length) {
      return [];
    }

    const payloads = products
      .map((product) => {
        const productComposition = compositionsByProduct[product.id];

        const raw_materials =
          rawMaterials
            ?.map((rawMaterial) => ({
              id: rawMaterial.id,
              quantity: Number(
                productComposition?.rawMaterials?.[rawMaterial.id] ?? 0,
              ),
            }))
            .filter((item) => item.quantity > 0) ?? [];

        const purchase_items =
          purchaseItens
            ?.map((purchaseItem) => ({
              id: purchaseItem.id,
              quantity: Number(
                productComposition?.purchaseItems?.[purchaseItem.id] ?? 0,
              ),
            }))
            .filter((item) => item.quantity > 0) ?? [];

        return {
          produto_id: product.id,
          raw_materials,
          purchase_items,
        };
      })
      .filter(
        (payload) =>
          payload.raw_materials.length > 0 || payload.purchase_items.length > 0,
      );

    return payloads;
  };

  const handleSubmit = async () => {
    try {
      const payloads = getPayloads();

      if (!payloads.length) {
        toast.error("Preencha ao menos uma quantidade para cadastrar.");
        return;
      }

      setIsSubmitting(true);

      await Promise.all(
        payloads.map((payload) =>
          apiClient.post(COMPOSITION_ENDPOINT, payload),
        ),
      );

      toast.success("Composição cadastrada com sucesso!");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Erro ao cadastrar composição:", error.response?.data);
      } else {
        console.error("Erro ao cadastrar composição:", error);
      }

      toast.error("Erro ao cadastrar composição. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-md shadow p-4 overflow-auto">
      <h1 className="text-xl text-[#5B85D5] font-bold">
        Cadastro de Composição de produtos
      </h1>

      {isGettingData && (
        <Loader message="Carregando os produtos, matéria-prima e itens de compra ..." />
      )}
      {!isGettingData && (
        <>
          <div className="rounded-lg overflow-y-auto mt-2 h-fit max-h-[470px] overflow-x-auto">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Produto</th>
                  {rawMaterials?.map((item) => (
                    <th key={item.id} className="px-4 py-2 text-left">
                      {item.nome}
                    </th>
                  ))}
                  {purchaseItens?.map((item) => (
                    <th key={item.id} className="px-4 py-2 text-left">
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products?.map((item) => (
                  <tr key={item.id} className="border">
                    <td className="px-4 py-2">
                      <select
                        disabled
                        className="w-full border rounded p-1 disabled:border disabled:border-gray-200 disabled:text-gray-500"
                        defaultValue={item.name}
                      >
                        <option defaultChecked>{item.name}</option>
                      </select>
                    </td>
                    {rawMaterials?.map((rawMaterial) => (
                      <td key={rawMaterial.id} className="px-4 py-2">
                        <input
                          type="number"
                          min={0}
                          step="any"
                          placeholder="0"
                          value={
                            compositionsByProduct[item.id]?.rawMaterials?.[
                              rawMaterial.id
                            ] ?? ""
                          }
                          onChange={(event) =>
                            handleQuantityChange({
                              productId: item.id,
                              itemId: rawMaterial.id,
                              quantity: event.target.value,
                              type: "rawMaterials",
                            })
                          }
                          className="w-24 border rounded p-1"
                        />
                      </td>
                    ))}
                    {purchaseItens?.map((purchaseItem) => (
                      <td key={purchaseItem.id} className="px-4 py-2">
                        <input
                          type="number"
                          min={0}
                          step="any"
                          placeholder="0"
                          value={
                            compositionsByProduct[item.id]?.purchaseItems?.[
                              purchaseItem.id
                            ] ?? ""
                          }
                          onChange={(event) =>
                            handleQuantityChange({
                              productId: item.id,
                              itemId: purchaseItem.id,
                              quantity: event.target.value,
                              type: "purchaseItems",
                            })
                          }
                          className="w-24 border rounded p-1"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end mt-4">
            <button
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="disabled:bg-blue-300 cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting
                ? hasDefaultCompositions
                  ? "Atualizando..."
                  : "Cadastrando..."
                : hasDefaultCompositions
                  ? "Atualizar"
                  : "Cadastrar"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ComposicaoTable;
