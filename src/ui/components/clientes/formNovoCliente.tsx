import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
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
  setCliente: () => void;
}

function FormNovoCliente({
  setNovoCliente,
  setCliente,
}: IFormNovoClienteProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ICriarClienteBody>({
    resolver: zodResolver(criarClienteSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      external_id: "",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const { data: res } = await apiClient.post<ICliente>("/clients", {
        external_id: data.external_id.trim(),
        name: data.name,
        priority: parseInt(data.priority),
      });
      toast.success("Cliente criado com sucesso!");
      setCliente();
      setNovoCliente(false);
      console.log(res);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      const detail = error instanceof AxiosError ? error.response?.data?.detail : null;
      toast.error(
        typeof detail === "string" ? detail : "Erro ao criar cliente. Tente novamente.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-10 my-6"
    >
      <div className="w-full flex flex-col gap-3">
        <label
          htmlFor="novo-cliente-id"
          className="text-[#212A4F] font-semibold truncate text-ellipsis"
        >
          ID externo
          <span className="text-[#B90D0D]"> *</span>
        </label>
        <input
          id="novo-cliente-id"
          placeholder="ID do ERP"
          type="text"
          maxLength={120}
          className="w-full outline-none border-b border-[#A4AABC]"
          {...register("external_id")}
        />
        {errors.external_id && (
          <ErrorMessage
            errors={errors}
            name="external_id"
            render={({ message }) => <FormErrorMessage message={message} />}
          />
        )}
      </div>

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
            <select
              id="prioridade"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("priority")}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
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
          disable={isSubmitting}
          isLoading={isSubmitting}
          type="submit"
        />
      </div>
    </form>
  );
}

export default FormNovoCliente;
