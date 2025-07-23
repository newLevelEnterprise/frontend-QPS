import { ErrorMessage } from "@hookform/error-message";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { type IEditarProdutoBody } from "../../../schemas/produto";
import type { IProduto } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface FormEditarProdutoProps {
  produto: Pick<IProduto, "id" | "name" | "cycle" | "scrap" | "bottleneck">;
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
    defaultValues: {
      name: produto.name,
      refugo: String(produto.scrap),
      ciclo: String(produto.cycle),
      bottleneck: produto.bottleneck.toString(),
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      await apiClient.put(`/products/${produto.id}`, {
        name: data.name,
        cycle: parseInt(data.ciclo),
        bottleneck: parseInt(data.bottleneck),
        scrap: parseInt(data.refugo),
      });
      setProducts();
      toast.success("Produto criado com sucesso!");
      setEditarProduto(false);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast.error("Erro ao criar produto. Tente novamente.");
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

      <div className="w-full flex flex-col md:flex-row gap-4">
        <div className="w-1/2">
          <div className="w-full flex flex-col gap-3">
            <label
              htmlFor="ciclo"
              className="text-[#212A4F] font-semibold truncate text-ellipsis"
            >
              Ciclo do produto (Seg/pç)
            </label>
            <div className="flex gap-1 relative">
              <input
                id="ciclo"
                placeholder="Ciclo do Produto (Seg/pç)"
                type="number"
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("ciclo")}
              />
              <span className="absolute right-4 text-xs">Seg/pç</span>
            </div>
            {errors.ciclo && (
              <ErrorMessage
                errors={errors}
                name="ciclo"
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            )}
          </div>
        </div>
        <div className="w-1/2">
          <div className="w-full flex flex-col gap-3">
            <label
              htmlFor="refugo"
              className="text-[#212A4F] font-semibold truncate text-ellipsis"
            >
              Refugo do produto (em %)
            </label>
            <div className="flex gap-1 relative">
              <input
                id="refugo"
                placeholder="Refugo do produto (em %)"
                type="number"
                min={0}
                max={100}
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("refugo")}
              />
              <span className="absolute right-5 text-xs">%</span>
            </div>
            {errors.refugo && (
              <ErrorMessage
                errors={errors}
                name="refugo"
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        <label
          htmlFor="Gargalo"
          className="text-[#212A4F] font-semibold truncate text-ellipsis"
        >
          Tempo Restante de Processamento
        </label>
        <div className="flex gap-1">
          <input
            id="Gargalo"
            placeholder="Tempo Restante de Processamento"
            type="number"
            className="w-full outline-none border-b border-[#A4AABC]"
            {...register("bottleneck")}
          />
        </div>
        {errors.bottleneck && (
          <ErrorMessage
            errors={errors}
            name="bottleneck"
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
