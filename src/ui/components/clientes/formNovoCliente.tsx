import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  criarClienteSchema,
  type ICriarClienteBody,
} from "../../../schemas/cliente";
import type { ICliente } from "../../../types/Cliente";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormNovoClienteProps {
  setNovoCliente: Dispatch<SetStateAction<boolean>>;
  setCliente: Dispatch<SetStateAction<ICliente[]>>;
}

function FormNovoCliente({setNovoCliente, setCliente}: IFormNovoClienteProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarClienteBody>({
    resolver: zodResolver(criarClienteSchema),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const { data: res } = await apiClient.post<ICliente>("/clients/", {
        name: data.name,
        priority: parseInt(data.priority),
      });
      toast.success("Cliente criado com sucesso!");
      setCliente(prev => [...prev, {
        id: res.id,
        name: res.name,
        priority: res.priority
      }]);
      setNovoCliente(false);
      console.log(res);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast.error("Erro ao criar cliente. Tente novamente.");
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
          Nome do cliente
        </label>
        <div className="flex gap-1">
          <input
            id="nome"
            placeholder="Nome do cliente"
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
            htmlFor="prioridade"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Prioridade do cliente
          </label>
          <div className="flex gap-1">
            <input
              id="prioridade"
              placeholder="Prioridade do cliente"
              type="number"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("priority")}
            />
          </div>
          {errors.priority && (
            <ErrorMessage
              errors={errors}
              name="priority"
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

export default FormNovoCliente;
