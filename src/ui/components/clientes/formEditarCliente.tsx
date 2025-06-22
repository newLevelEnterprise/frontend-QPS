import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  editarClienteSchema,
  type IEditarClienteBody
} from "../../../schemas/cliente";
import type { ICliente } from "../../../types/Cliente";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormNovoClienteProps {
  cliente: ICliente;
  setEditarCliente: Dispatch<SetStateAction<boolean>>;
  setCliente: Dispatch<SetStateAction<ICliente[]>>;
}

function FormEditarCliente({cliente, setEditarCliente, setCliente}: IFormNovoClienteProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<IEditarClienteBody>({
    resolver: zodResolver(editarClienteSchema),
    defaultValues: {
      name: cliente.name,
      priority: cliente.priority.toString(),
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const { data: res } = await apiClient.put<ICliente>(`/clients/${cliente.id}`, {
        name: data.name,
        priority: parseInt(data.priority),
      });
      setCliente(prev => {
        const newClientes = [...prev];
        const index = newClientes.findIndex(c => c.id === cliente.id);
        newClientes[index] = {
          id: cliente.id,
          name: res.name,
          priority: res.priority
        }

        return newClientes;
      })
      toast.success("Cliente atualizado com sucesso!");
      setEditarCliente(false);
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast.error("Erro ao atualizar cliente. Tente novamente.");
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

export default FormEditarCliente;
