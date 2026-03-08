import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import Loader from "../Loader";
import type { NovaComposicaoFormState } from "./formNovaComposicao";

interface ProductCompositionResponse {
  produto_id: number;
  produto_nome: string;
  raw_materials: {
    raw_material_id: number;
    quantity: string;
    nome: string;
  }[];
  purchase_items: {
    purchase_item_id: number;
    quantity: string;
    name: string;
  }[];
}

export interface EditarComposicaoFormState extends NovaComposicaoFormState {
  id: number;
}

interface FormEditComposicaoProps {
  compositionId: number;
  onSubmit?: (data: EditarComposicaoFormState) => void;
  isSubmitting?: boolean;
}

function FormEditComposicao({
  compositionId,
  onSubmit,
  isSubmitting,
}: FormEditComposicaoProps) {
  const [formState, setFormState] = useState<EditarComposicaoFormState>({
    id: compositionId,
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
      id: compositionId,
      productId: composition.produto_nome,
      rawMaterials: composition.raw_materials.map((rawMaterial) => ({
        id: rawMaterial.raw_material_id,
        quantity: Number(rawMaterial.quantity),
      })),
      purchaseItems: composition.purchase_items.map((purchaseItem) => ({
        id: purchaseItem.purchase_item_id,
        quantity: Number(purchaseItem.quantity),
      })),
    });
  }, [composition, compositionId, isCompositionSuccess]);

  const isGettingData = isFetchingComposition;

  console.log(composition);

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

          <div className="w-full grid grid-cols-2 gap-3 overflow-y-auto max-h-[300px] 2xl:max-h-[400px]">
            {composition?.raw_materials.map((rawMaterial) => (
              <div
                key={rawMaterial.raw_material_id}
                className="w-full flex flex-col gap-3"
              >
                <label
                  htmlFor={`raw-material-${rawMaterial.raw_material_id}`}
                  className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
                >
                  % {rawMaterial.nome}
                </label>
                <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
                  <input
                    type="number"
                    id={`raw-material-${rawMaterial.raw_material_id}`}
                    className="w-full h-full outline-none"
                    value={
                      formState.rawMaterials.find(
                        (rm) => rm.id === rawMaterial.raw_material_id,
                      )?.quantity ?? "0"
                    }
                    onChange={(event) =>
                      handleRawMaterialChange(
                        rawMaterial.raw_material_id,
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>
            ))}
            {composition?.purchase_items.map((purchaseItem) => (
              <div
                key={purchaseItem.purchase_item_id}
                className="w-full flex flex-col gap-3"
              >
                <label
                  htmlFor={`purchase-item-${purchaseItem.purchase_item_id}`}
                  className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
                >
                  {purchaseItem.name} (Kg)
                </label>
                <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
                  <input
                    type="number"
                    id={`purchase-item-${purchaseItem.purchase_item_id}`}
                    className="w-full h-full outline-none"
                    value={
                      formState.purchaseItems.find(
                        (pi) => pi.id === purchaseItem.purchase_item_id,
                      )?.quantity ?? "0"
                    }
                    onChange={(event) =>
                      handlePurchaseItemChange(
                        purchaseItem.purchase_item_id,
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
