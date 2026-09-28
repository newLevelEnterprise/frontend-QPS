import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import {
  criarProdutoSchema,
  type ICriarProdutoBody,
} from "../../../schemas/produto";
import type { IProduto } from "../../../types/Produto";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface ProductCadastroFormProps {
  idPrefix: string;
  products: IProduto[];
  defaultValues: ICriarProdutoBody;
  excludeProductId?: number;
  knownNames?: Record<string, string>;
  onCancel: () => void;
  onSave: (data: ICriarProdutoBody) => Promise<void>;
}

const inputClass =
  "h-10 w-full rounded-md border border-[#d6dbe4] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#7da2ff] focus:shadow-[0_0_0_3px_rgba(37,93,200,0.10)]";

const auxiliaryButtonClass =
  "h-10 cursor-pointer whitespace-nowrap rounded-full border border-[#d6dbe4] bg-white px-4 text-sm font-semibold text-[#334155] disabled:cursor-not-allowed disabled:opacity-60";

function pieceIds(products: IProduto[]) {
  const ids = new Set<number>();
  for (const product of products) {
    for (const part of product.structure_components ?? []) {
      if (part.id !== product.id) {
        ids.add(part.id);
      }
    }
  }
  return ids;
}

function ProductCadastroForm({
  idPrefix,
  products,
  defaultValues,
  excludeProductId,
  knownNames = {},
  onCancel,
  onSave,
}: ProductCadastroFormProps) {
  const [newExternalId, setNewExternalId] = useState("");
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [selectedId, setSelectedId] = useState("");
  const [selectedQty, setSelectedQty] = useState("1");
  const [createSuccess, setCreateSuccess] = useState("");
  const [showCompoundValidation, setShowCompoundValidation] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ICriarProdutoBody>({
    resolver: zodResolver(criarProdutoSchema),
    defaultValues,
  });

  const structureType = watch("structureType");
  const components = watch("components") || [];
  const selectableProducts = products.filter(
    (product) =>
      product.id !== excludeProductId && pieceIds(products).has(product.id),
  );

  useEffect(() => {
    if (components.length >= 2) {
      setShowCompoundValidation(false);
    }
  }, [components.length]);

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    const values = getValues();
    const count = values.components?.length ?? 0;
    if (values.structureType === "compound" && count < 2) {
      event.preventDefault();
      setShowCompoundValidation(true);
      return;
    }
    setShowCompoundValidation(false);
    void handleSubmit(onSave)(event);
  };

  const selectStructure = (value: "simple" | "compound") => {
    setValue("structureType", value);
    setShowCompoundValidation(false);
    if (value === "simple") {
      setValue("components", []);
      setCreateSuccess("");
    }
  };

  const quantityOrOne = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return "1";
    }
    return String(parsed);
  };

  const displayName = (
    component: NonNullable<ICriarProdutoBody["components"]>[number],
  ) => {
    if (component.component_product_id) {
      return (
        products.find(
          (product) => String(product.id) === component.component_product_id,
        )?.name ||
        knownNames[component.component_product_id] ||
        "Componente"
      );
    }
    return component.name || "Componente";
  };

  const addNewComponent = () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    const quantity = quantityOrOne(newQty);
    const alreadyAdded = components.some(
      (component) => displayName(component).trim().toLowerCase() === name.toLowerCase(),
    );
    if (alreadyAdded) {
      return;
    }
    setValue(
      "components",
      [...components, { name, external_id: newExternalId.trim(), quantity }],
      { shouldDirty: true },
    );
    setNewExternalId("");
    setNewName("");
    setNewQty("1");
    setCreateSuccess(`"${name}" cadastrado e adicionado à composição.`);
  };

  const addExistingComponent = () => {
    if (!selectedId) {
      return;
    }
    const alreadyAdded = components.some(
      (component) => component.component_product_id === selectedId,
    );
    if (alreadyAdded) {
      return;
    }
    setValue(
      "components",
      [
        ...components,
        {
          component_product_id: selectedId,
          name: "",
          external_id:
            products.find((product) => String(product.id) === selectedId)
              ?.external_id ?? "",
          quantity: quantityOrOne(selectedQty),
        },
      ],
      { shouldDirty: true },
    );
    setSelectedId("");
    setSelectedQty("1");
    setCreateSuccess("");
  };

  const removeComponent = (index: number) => {
    setValue(
      "components",
      components.filter((_, currentIndex) => currentIndex !== index),
      { shouldDirty: true },
    );
  };

  return (
    <form onSubmit={onFormSubmit} className="flex w-[min(580px,92vw)] flex-col">
      <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto py-2">
        <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-[120px_minmax(0,1fr)_150px]">
          <div className="flex flex-col gap-2">
            <label
              htmlFor={`${idPrefix}-id`}
              className="text-sm font-semibold text-[#212A4F]"
            >
              ID
            </label>
            <input
              id={`${idPrefix}-id`}
              placeholder="ID do ERP"
              type="text"
              maxLength={120}
              className={inputClass}
              {...register("external_id")}
            />
            {errors.external_id && (
              <ErrorMessage
                errors={errors}
                name="external_id"
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor={`${idPrefix}-nome`}
              className="text-sm font-semibold text-[#212A4F]"
            >
              Nome do produto
            </label>
            <input
              id={`${idPrefix}-nome`}
              placeholder="Nome do produto"
              type="text"
              className={inputClass}
              {...register("name")}
            />
            {errors.name && (
              <ErrorMessage
                errors={errors}
                name="name"
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor={`${idPrefix}-post`}
              className="text-sm font-semibold text-[#212A4F]"
            >
              Pós-injeção (s)
            </label>
            <input
              id={`${idPrefix}-post`}
              type="number"
              min="0"
              step="1"
              className={inputClass}
              {...register("post_injection_cycle_time")}
            />
            <p
              className="truncate text-xs text-[#6b7280]"
              title="Tempo aplicado ao produto após o processo de injeção."
            >
              Tempo após a injeção
            </p>
            {errors.post_injection_cycle_time && (
              <ErrorMessage
                errors={errors}
                name="post_injection_cycle_time"
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#212A4F]">
            Estrutura do produto
          </span>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3.5 ${
                structureType === "simple"
                  ? "border-[#255DC8] bg-[#eef4ff]"
                  : "border-[#d6dbe4] bg-white"
              }`}
            >
              <input
                type="radio"
                className="mt-0.5 accent-[#255DC8]"
                checked={structureType === "simple"}
                onChange={() => selectStructure("simple")}
              />
              <span>
                <span className="mb-1 block text-sm font-semibold text-[#212A4F]">
                  Produto simples
                </span>
                <span className="block text-xs leading-snug text-[#6b7280]">
                  Produto único, sem composição de outros itens.
                </span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3.5 ${
                structureType === "compound"
                  ? "border-[#255DC8] bg-[#eef4ff]"
                  : "border-[#d6dbe4] bg-white"
              }`}
            >
              <input
                type="radio"
                className="mt-0.5 accent-[#255DC8]"
                checked={structureType === "compound"}
                onChange={() => selectStructure("compound")}
              />
              <span>
                <span className="mb-1 block text-sm font-semibold text-[#212A4F]">
                  Produto composto
                </span>
                <span className="block text-xs leading-snug text-[#6b7280]">
                  Produto formado por dois ou mais componentes.
                </span>
              </span>
            </label>
          </div>
        </div>

        {structureType === "compound" && (
          <section className="border-t border-[#eef0f4] pt-5">
            <div className="mb-3 flex items-end justify-between gap-3">
              <span className="text-sm font-semibold text-[#212A4F]">
                Composição do produto
              </span>
              <span className="text-xs text-[#6b7280]">
                {components.length === 1
                  ? "1 componente"
                  : `${components.length} componentes`}
              </span>
            </div>

            <div className="mb-3.5 rounded-lg border border-[#e6eaf0] bg-[#fafbfc] p-3">
              <div className="mb-2 text-xs font-bold text-[#475569]">
                Cadastrar novo componente
              </div>
              <div className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-[110px_minmax(0,1fr)_78px_auto]">
                <div>
                  <label
                    htmlFor={`${idPrefix}-new-id`}
                    className="mb-1.5 block text-xs font-semibold text-[#212A4F]"
                  >
                    ID
                  </label>
                  <input
                    id={`${idPrefix}-new-id`}
                    type="text"
                    placeholder="ID do ERP"
                    maxLength={120}
                    className={inputClass}
                    value={newExternalId}
                    onChange={(event) => setNewExternalId(event.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${idPrefix}-new-component`}
                    className="mb-1.5 block text-xs font-semibold text-[#212A4F]"
                  >
                    Novo componente
                  </label>
                  <input
                    id={`${idPrefix}-new-component`}
                    type="text"
                    placeholder="Nome do componente"
                    className={inputClass}
                    value={newName}
                    onChange={(event) => {
                      setNewName(event.target.value);
                      setCreateSuccess("");
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${idPrefix}-new-qty`}
                    className="mb-1.5 block text-xs font-semibold text-[#212A4F]"
                  >
                    Qtd.
                  </label>
                  <input
                    id={`${idPrefix}-new-qty`}
                    type="number"
                    min="1"
                    className={inputClass}
                    value={newQty}
                    onChange={(event) => setNewQty(event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className={auxiliaryButtonClass}
                  onClick={addNewComponent}
                >
                  Adicionar
                </button>
              </div>
              <p className="mt-1.5 text-xs text-[#6b7280]">
                Ao cadastrar, o componente já entra diretamente na composição do produto.
              </p>
              {createSuccess && (
                <p className="mt-2 text-xs text-[#15803d]">{createSuccess}</p>
              )}
            </div>

            <div className="mb-3 grid grid-cols-1 items-end gap-2.5 sm:grid-cols-[minmax(0,1fr)_88px_auto]">
              <div>
                <label
                  htmlFor={`${idPrefix}-component`}
                  className="mb-1.5 block text-xs font-semibold text-[#212A4F]"
                >
                  Componente
                </label>
                <select
                  id={`${idPrefix}-component`}
                  className={inputClass}
                  value={selectedId}
                  onChange={(event) => setSelectedId(event.target.value)}
                >
                  <option value="">Selecione um componente</option>
                  {selectableProducts.map((product) => (
                    <option key={product.id} value={String(product.id)}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor={`${idPrefix}-qty`}
                  className="mb-1.5 block text-xs font-semibold text-[#212A4F]"
                >
                  Quantidade
                </label>
                <input
                  id={`${idPrefix}-qty`}
                  type="number"
                  min="1"
                  className={inputClass}
                  value={selectedQty}
                  onChange={(event) => setSelectedQty(event.target.value)}
                />
              </div>
              <button
                type="button"
                className={auxiliaryButtonClass}
                onClick={addExistingComponent}
              >
                Adicionar
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#d6dbe4]">
              <div className="grid grid-cols-[110px_minmax(0,1fr)_90px_32px] gap-2.5 border-b border-[#d6dbe4] bg-[#f8fafc] px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">
                <div>ID</div>
                <div>Componente</div>
                <div>Qtd.</div>
                <div />
              </div>
              <div className="max-h-[190px] overflow-auto">
                {components.length === 0 ? (
                  <div className="px-3 py-5 text-center text-sm text-[#6b7280]">
                    Nenhum componente adicionado.
                  </div>
                ) : (
                  components.map((component, index) => (
                    <div
                      key={`${component.component_product_id || component.name}-${index}`}
                      className="grid grid-cols-[110px_minmax(0,1fr)_90px_32px] items-center gap-2.5 border-b border-[#eef0f4] px-3 py-2.5 text-sm last:border-b-0"
                    >
                      <input
                        type="text"
                        maxLength={120}
                        placeholder="ID do ERP"
                        className={inputClass}
                        value={component.external_id || ""}
                        onChange={(event) => {
                          const next = [...components];
                          next[index] = {
                            ...component,
                            external_id: event.target.value,
                          };
                          setValue("components", next, { shouldDirty: true });
                        }}
                      />
                      <div className="truncate">{displayName(component)}</div>
                      <div>{component.quantity}</div>
                      <button
                        type="button"
                        aria-label="Remover componente"
                        className="cursor-pointer text-lg leading-none text-[#dc2626]"
                        onClick={() => removeComponent(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {showCompoundValidation && (
              <p className="mt-2.5 text-xs text-[#b45309]">
                Produto composto precisa ter pelo menos 2 componentes.
              </p>
            )}
          </section>
        )}
      </div>

      <div className="mt-2 flex justify-end gap-2.5 border-t border-[#eef0f4] pt-4">
        <button type="button" className={auxiliaryButtonClass} onClick={onCancel}>
          Cancelar
        </button>
        <Button
          title="Salvar produto"
          type="submit"
          disable={isSubmitting}
          isLoading={isSubmitting}
        />
      </div>
    </form>
  );
}

export default ProductCadastroForm;
