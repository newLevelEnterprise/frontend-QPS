import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { ICriarProdutoBody } from "../../../schemas/produto";
import type { IProduto } from "../../../types/Produto";

interface ProductStructureFieldsProps {
  register: UseFormRegister<ICriarProdutoBody>;
  watch: UseFormWatch<ICriarProdutoBody>;
  setValue: UseFormSetValue<ICriarProdutoBody>;
  availableProducts: IProduto[];
  excludeProductId?: number;
}

function ProductStructureFields({
  register,
  watch,
  setValue,
  availableProducts,
  excludeProductId,
}: ProductStructureFieldsProps) {
  const structureType = watch("structureType");
  const components = watch("components") || [];
  const componentPieceIds = new Set<number>();
  for (const product of availableProducts) {
    for (const part of product.structure_components ?? []) {
      if (part.id !== product.id) {
        componentPieceIds.add(part.id);
      }
    }
  }
  const selectableProducts = availableProducts.filter(
    (product) =>
      product.id !== excludeProductId && componentPieceIds.has(product.id),
  );

  const structureTypeRegister = register("structureType", {
    onChange: (event) => {
      if (event.target.value === "simple") {
        setValue("components", []);
      } else if (!watch("components")?.length) {
        setValue("components", [{ name: "", quantity: "1" }]);
      }
    },
  });

  const addComponent = () => {
    setValue("components", [...components, { name: "", quantity: "1" }], {
      shouldDirty: true,
    });
  };

  const removeComponent = (index: number) => {
    setValue(
      "components",
      components.filter((_, currentIndex) => currentIndex !== index),
      { shouldValidate: true },
    );
  };

  return (
    <>
      <div className="w-full flex flex-col gap-3">
        <span className="text-[#212A4F] font-semibold text-sm">
          Estrutura do produto
        </span>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-[#212A4F]">
            <input type="radio" value="simple" {...structureTypeRegister} />
            Produto simples
          </label>
          <label className="flex items-center gap-2 text-sm text-[#212A4F]">
            <input type="radio" value="compound" {...structureTypeRegister} />
            Produto composto
          </label>
        </div>
      </div>

      {structureType === "compound" && (
        <div className="w-full flex flex-col gap-4">
          {components.map((_, index) => (
            <div
              key={index}
              className="w-full flex flex-col gap-3 border border-gray-200 rounded-lg p-3"
            >
              <div className="w-full flex flex-col gap-2">
                <label className="text-[#212A4F] font-semibold text-sm">
                  Peça existente
                </label>
                <select
                  className="w-full outline-none border-b border-[#A4AABC] p-1"
                  {...register(`components.${index}.component_product_id` as const)}
                  onChange={(event) => {
                    const value = event.target.value;
                    setValue(`components.${index}.component_product_id`, value);
                    if (value) {
                      setValue(`components.${index}.name`, "");
                    }
                  }}
                >
                  <option value="">Nova peça pelo nome</option>
                  {selectableProducts.map((product) => (
                    <option key={product.id} value={String(product.id)}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full flex flex-col gap-2">
                <label className="text-[#212A4F] font-semibold text-sm">
                  Ou nome da nova peça
                </label>
                <input
                  type="text"
                  placeholder="Ex: Corpo, Tampa, Clip"
                  className="w-full outline-none border-b border-[#A4AABC]"
                  disabled={Boolean(watch(`components.${index}.component_product_id`))}
                  {...register(`components.${index}.name` as const)}
                />
              </div>
              <div className="w-full flex items-end gap-3">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[#212A4F] font-semibold text-sm">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className="w-full outline-none border-b border-[#A4AABC]"
                    {...register(`components.${index}.quantity` as const)}
                  />
                </div>
                {components.length > 1 && (
                  <button
                    type="button"
                    className="text-red-500 text-sm font-medium pb-1"
                    onClick={() => removeComponent(index)}
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="text-blue-600 text-sm font-medium self-start"
            onClick={addComponent}
          >
            Adicionar componente
          </button>
        </div>
      )}
    </>
  );
}

export default ProductStructureFields;

export function structureErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Estrutura inválida";
  }
  const record = error as {
    message?: string;
    [key: string]: unknown;
  };
  if (typeof record.message === "string" && record.message) {
    return record.message;
  }
  for (const value of Object.values(record)) {
    if (!value || typeof value !== "object") {
      continue;
    }
    const field = value as {
      name?: { message?: string };
      quantity?: { message?: string };
    };
    const message = field.name?.message || field.quantity?.message;
    if (message) {
      return message;
    }
  }
  return "Estrutura inválida";
}

export function toProductStructurePayload(data: ICriarProdutoBody) {
  if (data.structureType === "simple") {
    return [];
  }
  return (data.components || []).map((component) => {
    const quantity = Number(component.quantity);
    const externalId = (component.external_id || "").trim();
    if (component.component_product_id) {
      return {
        component_product_id: Number(component.component_product_id),
        external_id: externalId || null,
        quantity,
      };
    }
    return {
      name: (component.name || "").trim(),
      external_id: externalId || null,
      quantity,
    };
  });
}
