import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  type IEditarMaquinaBody,
  editarMaquinaSchema,
} from "../../../schemas/maquinas";
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
  } = useForm<IEditarMaquinaBody>({
    resolver: zodResolver(editarMaquinaSchema),
    defaultValues: {
      name: maquina.name,
      disponibilidade: maquina.disponibilidade.toString(),
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      await apiClient.put<IMaquinas>(`/maquinas/${maquina.id}`, {
        name: data.name,
        disponibilidade: parseInt(data.disponibilidade),
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
          Nome da máquina
        </label>
        <div className="flex gap-1">
          <input
            id="nome"
            placeholder="Nome da máquina"
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

      <div className="w-1/2">
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="disponibilidade"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Disponibilidade (%)
          </label>
          <div className="flex gap-1">
            <input
              id="disponibilidade"
              placeholder="Disponibilidade (%)"
              type="number"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("disponibilidade")}
            />
          </div>
          {errors.disponibilidade && (
            <ErrorMessage
              errors={errors}
              name="disponibilidade"
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

export default FormEditarMaquina;
