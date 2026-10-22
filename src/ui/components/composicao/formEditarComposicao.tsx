import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import Loader from "../Loader";
import type {
  NovaComposicaoFormState,
  PurchaseItem,
  RawMaterial,
} from "./formNovaComposicao";

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
  productId: number;
  onSubmit?: (data: EditarComposicaoFormState) => void;
  isSubmitting?: boolean;
}

function FormEditComposicao({
  productId,
  onSubmit,
  isSubmitting,
}: FormEditComposicaoProps) {
  const [formState, setFormState] = useState<EditarComposicaoFormState>({
    id: productId,
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
    queryKey: ["get", "product-composition", productId],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductCompositionResponse>(
        `/product-composition/product/${productId}`,
      );
      return data;
    },
    enabled: !!productId,
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

  useEffect(() => {
    if (!isCompositionSuccess || !composition) return;

    const rawMaterialsById = new Map(
      composition.raw_materials.map((rawMaterial) => [
        rawMaterial.raw_material_id,
        Number(rawMaterial.quantity),
      ]),
    );

    const rawMaterialsByName = new Map(
      composition.raw_materials.map((rawMaterial) => [
        rawMaterial.nome.trim().toLowerCase(),
        Number(rawMaterial.quantity),
      ]),
    );

    const purchaseItemsById = new Map(
      composition.purchase_items.map((purchaseItem) => [
        purchaseItem.purchase_item_id,
        Number(purchaseItem.quantity),
      ]),
    );

    const purchaseItemsByName = new Map(
      composition.purchase_items.map((purchaseItem) => [
        purchaseItem.name.trim().toLowerCase(),
        Number(purchaseItem.quantity),
      ]),
    );

    setFormState({
      id: productId,
      productId: composition.produto_nome,
      rawMaterials:
        rawMaterials?.map((rawMaterial) => {
          const quantityFromId = rawMaterialsById.get(rawMaterial.id);
          const quantityFromName = rawMaterialsByName.get(
            rawMaterial.nome.trim().toLowerCase(),
          );

          return {
            id: rawMaterial.id,
            quantity: quantityFromId ?? quantityFromName ?? 0,
          };
        }) ??
        composition.raw_materials.map((rawMaterial) => ({
          id: rawMaterial.raw_material_id,
          quantity: Number(rawMaterial.quantity),
        })),
      purchaseItems:
        purchaseItens?.map((purchaseItem) => {
          const quantityFromId = purchaseItemsById.get(purchaseItem.id);
          const quantityFromName = purchaseItemsByName.get(
            purchaseItem.name.trim().toLowerCase(),
          );

          return {
            id: purchaseItem.id,
            quantity: quantityFromId ?? quantityFromName ?? 0,
          };
        }) ??
        composition.purchase_items.map((purchaseItem) => ({
          id: purchaseItem.purchase_item_id,
          quantity: Number(purchaseItem.quantity),
        })),
    });
  }, [
    composition,
    productId,
    isCompositionSuccess,
    purchaseItens,
    rawMaterials,
  ]);

  const isGettingData =
    isFetchingComposition || isFetchingRawMaterials || isFetchingPurchaseItens;

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
              htmlFor="componente"
              className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
            >
              Componente
            </label>
            <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
              <input
                id="componente"
                className="w-full outline-none border-b border-[#A4AABC]"
                value={formState.productId}
                readOnly
              />
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 overflow-y-auto max-h-[300px] 2xl:max-h-[400px]">
            {rawMaterials?.map((rawMaterial) => (
              <div key={rawMaterial.id} className="w-full flex flex-col gap-3">
                <label
                  htmlFor={`raw-material-${rawMaterial.id}`}
                  className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
                >
                  {rawMaterial.nome} (Kg)
                </label>
                <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
                  <input
                    type="number"
                    step={0.0001}
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
            {purchaseItens?.map((purchaseItem) => (
              <div key={purchaseItem.id} className="w-full flex flex-col gap-3">
                <label
                  htmlFor={`purchase-item-${purchaseItem.id}`}
                  className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
                >
                  {purchaseItem.name} (Un)
                </label>
                <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
                  <input
                    type="number"
                    step={0.0001}
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
