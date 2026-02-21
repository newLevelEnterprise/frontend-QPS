import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  criarLinhasProdSchema,
  type ICriarLinhasProdBody,
} from "../../../schemas/linhas";
import type { IMaquinas } from "../../../types/Maquina";
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
  } = useForm<ICriarLinhasProdBody>({
    resolver: zodResolver(criarLinhasProdSchema),
  });

   
  const onSubmit = async (data: ICriarLinhasProdBody) => {
    try {
      const { data: res } = await apiClient.post<IMaquinas>("/maquinas", {
        name: data.codMolde,
        disponibilidade: parseInt(data.produto),
      });
      toast.success("Máquina criada com sucesso!");
      setMaquina();
      setNovaMaquina(false);
      console.log(res);
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

export default FormNovaMaquina;
