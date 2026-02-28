import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  editarLinhaSchema,
  type IEditarLinhaBody,
} from "../../../schemas/linhaProducao";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormEditarLinhaProps {
  linha: { id: number; name: string };
  setEditarLinha: Dispatch<SetStateAction<boolean>>;
  setLinha: () => void;
}

function FormEditarLinha({
  setEditarLinha,
  setLinha,
  linha,
}: IFormEditarLinhaProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<IEditarLinhaBody>({
    resolver: zodResolver(editarLinhaSchema),
    defaultValues: {
      name: linha.name,
    },
  });

  const onSubmit = async (data: IEditarLinhaBody) => {
    try {
      await apiClient.put(`/production-lines/${linha.id}`, {
        name: data.name,
      });
      setLinha();
      toast.success("Linha atualizada com sucesso!");
      setEditarLinha(false);
    } catch (error) {
      console.error("Erro ao atualizar linha:", error);
      toast.error("Erro ao atualizar linha. Tente novamente.");
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

export default FormEditarLinha;
