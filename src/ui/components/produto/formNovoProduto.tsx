import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  criarProdutoSchema,
  type ICriarProdutoBody,
} from "../../../schemas/produto";
import type { IProduto } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";
import ProductStructureFields, {
  toProductStructurePayload,
} from "./ProductStructureFields";

interface FormNovoProdutoProps {
  setNovoProduto: Dispatch<SetStateAction<boolean>>;
  setProducts: () => void;
}

function FormNovoProduto({
  setNovoProduto,
  setProducts,
}: FormNovoProdutoProps) {
  const { data: products = [] } = useQuery({
    queryKey: ["get", "all", "products"],
    queryFn: async () => {
      const { data } = await apiClient.get<IProduto[]>("/products/");
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarProdutoBody>({
    resolver: zodResolver(criarProdutoSchema),
    defaultValues: {
      name: "",
      structureType: "simple",
      components: [],
    },
  });

  const onSubmit = async (data: ICriarProdutoBody) => {
    try {
      await apiClient.post("/products", {
        name: data.name,
        components: toProductStructurePayload(data),
      });
      setProducts();
      toast.success("Produto criado com sucesso!");
      setNovoProduto(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        const detail = error.response?.data?.detail;
        toast.error(
          typeof detail === "string"
            ? detail
            : "Erro ao criar produto. Tente novamente.",
        );
        return;
      }
      toast.error("Erro ao criar produto. Tente novamente.");
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
      />
      {errors.components && (
        <FormErrorMessage
          message={errors.components.message || "Estrutura inválida"}
        />
      )}

      <div className="w-full flex justify-end">
        <Button
          title="Ok"
          disable={isSubmitting || !isValid}
          isLoading={isSubmitting}
          type="submit"
        />
      </div>
    </form>
  );
}

export default FormNovoProduto;
