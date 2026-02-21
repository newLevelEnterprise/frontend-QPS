import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  criarmoldesSchema,
  type ICriarMoldesBody,
} from "../../../schemas/moldes";
import type { IMoldes } from "../../../types/Moldes";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormEditarMoldeProps {
  molde: IMoldes;
  setEditarMolde: Dispatch<SetStateAction<boolean>>;
  setMolde: () => void;
}

function FormEditarMolde({
  setEditarMolde,
  setMolde,
  molde,
}: IFormEditarMoldeProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarMoldesBody>({
    resolver: zodResolver(criarmoldesSchema),
    defaultValues: {
      nome: molde.nome,
      produto: molde.produto,
      totalCavidades: molde.totalCavidades,
      cavidadesAbertas: molde.cavidadesAbertas,
      refugo: molde.refugo,
      riscoDeCavidade: molde.riscoDeCavidade,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const { data: res } = await apiClient.post<IMoldes>("/moldes", {
        nome: data.nome,
        produtos: data.produtos,
        totalCavidades: Number(data.totalCavidades),
        cavidadesAbertas: Number(data.cavidadesAbertas),
        refugo: Number(data.refugo),
        riscoDeCavidade: Number(data.riscoDeCavidade),
      });
      setMolde();
      toast.success("Molde criado com sucesso!");
      setEditarMolde(false);
      console.log(res);
    } catch (error) {
      console.error("Erro ao criar molde:", error);
      toast.error("Erro ao criar molde. Tente novamente.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-10 my-6"
    >
      <div className="flex flex-col gap-4">
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="nome"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            Nome
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="nome"
              placeholder="Nome do molde"
              type="text"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("nome")}
            />
          </div>
          {errors.nome && (
            <ErrorMessage
              errors={errors}
              name="nome"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>

        <div className="flex gap-6">
          <div className="w-full flex flex-col gap-3">
            <label
              htmlFor="totalCavidades"
              className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
            >
              Produto
            </label>
            <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
              <input
                id="produto"
                placeholder="Produto"
                type="text"
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("produto")}
              />
            </div>
            {errors.produto && (
              <ErrorMessage
                errors={errors}
                name="produto"
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            )}
          </div>
          <div className="w-full flex flex-col gap-3">
            <label
              htmlFor="totalCavidades"
              className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
            >
              totalCavidades
            </label>
            <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
              <input
                id="totalCavidades"
                placeholder="Total de Cavidades"
                type="number"
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("totalCavidades")}
              />
            </div>
            {errors.totalCavidades && (
              <ErrorMessage
                errors={errors}
                name="totalCavidades"
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            )}
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-full flex flex-col gap-3">
            <label
              htmlFor="cavidadesAbertas"
              className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
            >
              Cavidades Abertas
            </label>
            <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
              <input
                id="cavidadesAbertas"
                placeholder="Cavidades Abertas"
                type="number"
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("cavidadesAbertas")}
              />
            </div>
            {errors.cavidadesAbertas && (
              <ErrorMessage
                errors={errors}
                name="cavidadesAbertas"
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            )}
          </div>
          <div className="w-full flex flex-col gap-3">
            <label
              htmlFor="refugo"
              className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
            >
              Refugo
            </label>
            <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
              <input
                id="refugo"
                placeholder="Refugo"
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

        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="riscoDeCavidade"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            Risco de Cavidade
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="riscoDeCavidade"
              placeholder="Risco de Cavidade"
              type="number"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("riscoDeCavidade")}
            />
          </div>
          {errors.riscoDeCavidade && (
            <ErrorMessage
              errors={errors}
              name="riscoDeCavidade"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
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

export default FormEditarMolde;
