import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  editarLinhasProdSchema,
  type IEditarLinhasProdBody,
} from "../../../schemas/linhas";
import type { IMaquinas } from "../../../types/Maquina";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormEditarMaquinaProps {
  maquina: IMaquinas;
  setEditarMaquina: Dispatch<SetStateAction<boolean>>;
  setMaquina: () => void;
}

function FormEditarMaquina({
  maquina,
  setEditarMaquina,
  setMaquina,
}: IFormEditarMaquinaProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<IEditarLinhasProdBody>({
    resolver: zodResolver(editarLinhasProdSchema),
    defaultValues: {
      codMolde: maquina.codMolde,
      produto: maquina.produto,
    },
  });

  const onSubmit = async (data: IEditarLinhasProdBody) => {
    try {
      await apiClient.put<IMaquinas>(`/maquinas/${maquina.id}`, {
        name: data.codMolde,
        disponibilidade: parseInt(data.produto),
      });
      setMaquina();
      toast.success("Máquina atualizada com sucesso!");
      setEditarMaquina(false);
    } catch (error) {
      console.error("Erro ao atualizar máquina:", error);
      toast.error("Erro ao atualizar máquina. Tente novamente.");
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
          Produto
        </label>
        <div className="flex gap-1">
          <input
            id="nome"
            placeholder="Nome do produto"
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
          htmlFor="codMolde"
          className="text-[#212A4F] font-semibold truncate text-ellipsis"
        >
          Código do molde
        </label>
        <div className="flex gap-1">
          <input
            id="codMolde"
            placeholder="Código do molde"
            type="text"
            className="w-full outline-none border-b border-[#A4AABC]"
            {...register("codMolde")}
          />
        </div>
        {errors.codMolde && (
          <ErrorMessage
            errors={errors}
            name="codMolde"
            render={({ message }) => <FormErrorMessage message={message} />}
          />
        )}
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

export default FormEditarMaquina;
