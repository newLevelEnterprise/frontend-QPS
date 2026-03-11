import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import Loader from "../Loader";

export interface PurchaseItem {
  id: number;
  name: string;
}

export interface RawMaterial {
  id: number;
  nome: string;
}

export interface Product {
  id: number;
  name: string;
}

export interface NovaComposicaoFormState {
  productId: string;
  rawMaterials: { id: number; quantity: number }[];
  purchaseItems: { id: number; quantity: number }[];
}

interface FormNovaComposicaoProps {
  onSubmit?: (data: NovaComposicaoFormState) => void;
  isSubmitting?: boolean;
}

function FormNovaComposicao({
  onSubmit,
  isSubmitting,
}: FormNovaComposicaoProps) {
  const [formState, setFormState] = useState<NovaComposicaoFormState>({
    productId: "",
    rawMaterials: [],
    purchaseItems: [],
  });

  const handleProductChange = (value: string) => {
    setFormState((previousState) => ({
      ...previousState,
      productId: value,
    }));
  };

  const handleRawMaterialChange = (rawMaterialId: number, value: string) => {
    setFormState((previousState) => ({
      ...previousState,
      rawMaterials: previousState.rawMaterials.some(
        (rawMaterial) => rawMaterial.id === rawMaterialId,
      )
        ? previousState.rawMaterials.map((rawMaterial) =>
            rawMaterial.id === rawMaterialId
              ? { ...rawMaterial, quantity: Number(value) }
              : rawMaterial,
          )
        : [
            ...previousState.rawMaterials,
            { id: rawMaterialId, quantity: Number(value) },
          ],
    }));
  };

  const handlePurchaseItemChange = (purchaseItemId: number, value: string) => {
    setFormState((previousState) => ({
      ...previousState,
      purchaseItems: previousState.purchaseItems.some(
        (purchaseItem) => purchaseItem.id === purchaseItemId,
      )
        ? previousState.purchaseItems.map((purchaseItem) =>
            purchaseItem.id === purchaseItemId
              ? { ...purchaseItem, quantity: Number(value) }
              : purchaseItem,
          )
        : [
            ...previousState.purchaseItems,
            { id: purchaseItemId, quantity: Number(value) },
          ],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(formState);
  };

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

  const isGettingData =
    isFetching || isFetchingRawMaterials || isFetchingPurchaseItens;

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
              <select
                id="produto"
                className="w-full outline-none border-b border-[#A4AABC]"
                value={formState.productId}
                onChange={(event) => handleProductChange(event.target.value)}
              >
                <option value="" disabled>
                  Selecione o produto
                </option>
                {products?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 overflow-y-auto max-h-[300px] 2xl:max-h-[400px]">
            {rawMaterials?.map((rawMaterial) => (
              <div key={rawMaterial.id} className="w-full flex flex-col gap-3">
                <label
                  htmlFor={rawMaterial.nome}
                  className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
                >
                  {rawMaterial.nome} (Kg)
                </label>
                <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
                  <input
                    type="number"
                    step={0.0001}
                    id={rawMaterial.nome}
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
                  htmlFor={purchaseItem.name}
                  className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
                >
                  {purchaseItem.name} (Un)
                </label>
                <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
                  <input
                    type="number"
                    step={0.0001}
                    id={purchaseItem.name}
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

export default FormNovaComposicao;
