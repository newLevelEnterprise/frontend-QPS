import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import Loader from "../Loader";

interface ProductCompositionResponse {
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

export interface NovaComposicaoFormState {
  productId: string;
  rawMaterials: { id: number; quantity: number }[];
  purchaseItems: { id: number; quantity: number }[];
}

interface FormEditComposicaoProps {
  compositionId: number;
  onSubmit?: (data: NovaComposicaoFormState) => void;
  isSubmitting?: boolean;
}

function FormEditComposicao({
  compositionId,
  onSubmit,
  isSubmitting,
}: FormEditComposicaoProps) {
  const [formState, setFormState] = useState<NovaComposicaoFormState>({
    productId: "",
    rawMaterials: [],
    purchaseItems: [],
  });

  const handleRawMaterialChange = (rawMaterialId: number, value: string) => {
    const parsedValue = Number(value);
    setFormState((previousState) => ({
      ...previousState,
      rawMaterials: previousState.rawMaterials.some(
        (rawMaterial) => rawMaterial.id === rawMaterialId,
      )
        ? previousState.rawMaterials.map((rawMaterial) =>
            rawMaterial.id === rawMaterialId
              ? { ...rawMaterial, quantity: parsedValue }
              : rawMaterial,
          )
        : [
            ...previousState.rawMaterials,
            { id: rawMaterialId, quantity: parsedValue },
          ],
    }));
  };

  const handlePurchaseItemChange = (purchaseItemId: number, value: string) => {
    const parsedValue = Number(value);
    setFormState((previousState) => ({
      ...previousState,
      purchaseItems: previousState.purchaseItems.some(
        (purchaseItem) => purchaseItem.id === purchaseItemId,
      )
        ? previousState.purchaseItems.map((purchaseItem) =>
            purchaseItem.id === purchaseItemId
              ? { ...purchaseItem, quantity: parsedValue }
              : purchaseItem,
          )
        : [
            ...previousState.purchaseItems,
            { id: purchaseItemId, quantity: parsedValue },
          ],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(formState);
  };

  const {
    data: composition,
    isFetching: isFetchingComposition,
    isSuccess: isCompositionSuccess,
  } = useQuery({
    queryKey: ["get", "product-composition", compositionId],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductCompositionResponse>(
        `/product-composition/product/${compositionId}`,
      );
      return data;
    },
    enabled: !!compositionId,
  });

  useEffect(() => {
    if (!isCompositionSuccess || !composition) return;

    setFormState({
      productId: String(composition.produto_id),
      rawMaterials: composition.raw_materials.map((rawMaterial) => ({
        id: rawMaterial.id,
        quantity: Number(rawMaterial.quantity),
      })),
      purchaseItems: composition.purchase_items.map((purchaseItem) => ({
        id: purchaseItem.id,
        quantity: Number(purchaseItem.quantity),
      })),
    });
  }, [composition, isCompositionSuccess]);

  const isGettingData = isFetchingComposition;

  return (
    <div className="w-full h-full">
      {isGettingData && <Loader message="Carregando" />}
      {!isGettingData && (
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-10 my-6"
        >
          <div className="w-full flex flex-col gap-3">
            <label
              htmlFor="produto"
              className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
            >
              Produto
            </label>
            <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
              <input
                id="produto"
                className="w-full outline-none border-b border-[#A4AABC]"
                value={formState.productId}
                readOnly
              />
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 overflow-y-auto">
            {composition?.raw_materials.map((rawMaterial) => (
              <div key={rawMaterial.id} className="w-full flex flex-col gap-3">
                <label
                  htmlFor={`raw-material-${rawMaterial.id}`}
                  className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
                >
                  {rawMaterial.nome}
                </label>
                <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
                  <input
                    type="number"
                    id={`raw-material-${rawMaterial.id}`}
                    className="w-full h-full outline-none"
                    value={
                      formState.rawMaterials.find(
                        (rm) => rm.id === rawMaterial.id,
                      )?.quantity ?? "0"
                    }
                    onChange={(event) =>
                      handleRawMaterialChange(
                        rawMaterial.id,
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>
            ))}
            {composition?.purchase_items.map((purchaseItem) => (
              <div key={purchaseItem.id} className="w-full flex flex-col gap-3">
                <label
                  htmlFor={`purchase-item-${purchaseItem.id}`}
                  className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
                >
                  {purchaseItem.name}
                </label>
                <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
                  <input
                    type="number"
                    id={`purchase-item-${purchaseItem.id}`}
                    className="w-full h-full outline-none"
                    value={
                      formState.purchaseItems.find(
                        (pi) => pi.id === purchaseItem.id,
                      )?.quantity ?? "0"
                    }
                    onChange={(event) =>
                      handlePurchaseItemChange(
                        purchaseItem.id,
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="w-full flex justify-end">
            <Button
              title="Ok"
              disable={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
            />
          </div>
        </form>
      )}
    </div>
  );
}

export default FormEditComposicao;
