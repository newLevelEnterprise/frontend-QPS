import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
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

interface FormNovoProdutoProps {
  setNovoProduto: Dispatch<SetStateAction<boolean>>;
  setProducts: Dispatch<SetStateAction<IProduto[]>>;
}

function FormNovoProduto({
  setNovoProduto,
  setProducts,
}: FormNovoProdutoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarProdutoBody>({
    resolver: zodResolver(criarProdutoSchema),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const { data: res } = await apiClient.post("/products/", {
        name: data.name,
        cycle: data.ciclo,
        bottleneck: 0,
        scrap: data.refugo,
      });
      setProducts((prev) => [
        ...prev,
        {
          id: res.id,
          name: res.name,
          cycle: res.cycle,
          bottleneck: res.bottleneck,
          scrap: res.scrap,
        },
      ]);
      toast.success("Produto criado com sucesso!");
      setNovoProduto(false);
    } catch (error) {
      if(error instanceof AxiosError) {
        console.error("Erro ao criar pedido:", error);
      }
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
              Ciclo do produto
            </label>
            <div className="flex gap-1">
              <input
                id="ciclo"
                placeholder="Ciclo do Produto"
                type="number"
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("ciclo")}
              />
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
              Refugo do produto
            </label>
            <div className="flex gap-1">
              <input
                id="refugo"
                placeholder="Refugo do produto"
                type="number"
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("refugo")}
              />
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
