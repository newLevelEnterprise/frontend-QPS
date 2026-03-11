import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  criarMaquinaSchema,
  type ICriarMaquinaBody,
} from "../../../schemas/maquinas";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormNovaMaquinaProps {
  setNovaMaquina: Dispatch<SetStateAction<boolean>>;
  setMaquina: () => void;
}

function FormNovaMaquina({
  setNovaMaquina,
  setMaquina,
}: IFormNovaMaquinaProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarMaquinaBody>({
    resolver: zodResolver(criarMaquinaSchema),
  });

  const onSubmit = async (data: ICriarMaquinaBody) => {
    try {
      console.log("Dados do formulário:", data);
      if (isNaN(parseFloat(data.disponibilidade))) {
        toast.error("Disponibilidade deve ser um número válido.");
        return;
      }
      if (parseFloat(data.disponibilidade) < 0) {
        toast.error("Disponibilidade deve ser entre 0 e 100.");
        return;
      }
      await apiClient.post("/machines", {
        name: data.name,
        availability: parseFloat(data.disponibilidade),
      });
      toast.success("Máquina criada com sucesso!");
      setMaquina();
      setNovaMaquina(false);
    } catch (error) {
      console.error("Erro ao criar máquina:", error);
      toast.error("Erro ao criar máquina. Tente novamente.");
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
              step={0.01}
              min={0}
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

export default FormNovaMaquina;
