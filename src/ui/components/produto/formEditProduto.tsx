import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  editarProdutoSchema,
  type IEditarProdutoBody,
} from "../../../schemas/produto";
import type { IProduto } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";
import ProductStructureFields, {
  toProductStructurePayload,
} from "./ProductStructureFields";

interface FormEditarProdutoProps {
  produto: IProduto;
  setEditarProduto: Dispatch<SetStateAction<boolean>>;
  setProducts: () => void;
}

function FormEditarProduto({
  produto,
  setEditarProduto,
  setProducts,
}: FormEditarProdutoProps) {
  const { data: products = [] } = useQuery({
    queryKey: ["get", "all", "products"],
    queryFn: async () => {
      const { data } = await apiClient.get<IProduto[]>("/products/");
      return data;
    },
  });

  const isSimple =
    produto.is_simple ??
    (!produto.structure_components?.length ||
      (produto.structure_components.length === 1 &&
        produto.structure_components[0].id === produto.id &&
        produto.structure_components[0].quantity === 1));
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IEditarProdutoBody>({
    resolver: zodResolver(editarProdutoSchema),
    defaultValues: {
      name: produto.name,
      structureType: isSimple ? "simple" : "compound",
      components: isSimple
        ? []
        : (produto.structure_components || []).map((component) => ({
            component_product_id: String(component.id),
            name: "",
            quantity: String(component.quantity),
          })),
    },
  });

  const onSubmit = async (data: IEditarProdutoBody) => {
    try {
      await apiClient.put(`/products/${produto.id}`, {
        name: data.name,
        components: toProductStructurePayload(data),
      });
      setProducts();
      toast.success("Produto atualizado com sucesso!");
      setEditarProduto(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        const detail = error.response?.data?.detail;
        toast.error(
          typeof detail === "string"
            ? detail
            : "Erro ao editar produto. Tente novamente.",
        );
        return;
      }
      toast.error("Erro ao editar produto. Tente novamente.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-8 my-6 max-h-[70vh] overflow-y-auto"
    >
      <div className="w-full flex flex-col gap-3">
        <label
          htmlFor="nome"
          className="text-[#212A4F] font-semibold truncate text-ellipsis"
        >
          Nome do produto
        </label>
        <div className="flex gap-1">
          <input
            id="nome"
            placeholder="Nome do Produto"
            type="text"
            className="w-full outline-none border-b border-[#A4AABC]"
            {...register("name")}
          />
        </div>
        {errors.name && (
          <ErrorMessage
            errors={errors}
            name="name"
            render={({ message }) => <FormErrorMessage message={message} />}
          />
        )}
      </div>

      <ProductStructureFields
        register={register}
        watch={watch}
        setValue={setValue}
        availableProducts={products}
        excludeProductId={produto.id}
      />
      {errors.components && (
        <FormErrorMessage
          message={errors.components.message || "Estrutura inválida"}
        />
      )}

      <div className="w-full flex justify-end">
        <Button
          title="Ok"
          disable={isSubmitting}
          isLoading={isSubmitting}
          type="submit"
        />
      </div>
    </form>
  );
}

export default FormEditarProduto;
