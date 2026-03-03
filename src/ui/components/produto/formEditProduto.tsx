import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
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

interface FormEditarProdutoProps {
  produto: Pick<IProduto, "id" | "name">;
  setEditarProduto: Dispatch<SetStateAction<boolean>>;
  setProducts: () => void;
}

function FormEditarProduto({
  produto,
  setEditarProduto,
  setProducts,
}: FormEditarProdutoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IEditarProdutoBody>({
    resolver: zodResolver(editarProdutoSchema),
    defaultValues: {
      name: produto.name,
    },
  });
  const onSubmit = async (data: IEditarProdutoBody) => {
    try {
      await apiClient.put(`/products/${produto.id}`, {
        name: data.name,
      });
      setProducts();
      toast.success("Produto atualizado com sucesso!");
      setEditarProduto(false);
    } catch (error) {
      console.error("Erro ao editar produto:", error);
      toast.error("Erro ao editar produto. Tente novamente.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-10 my-6"
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
