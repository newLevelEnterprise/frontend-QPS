import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  criarInsumosSchema,
  type ICriarInsumosBody,
} from "../../../schemas/insumos";
import type { IInsumos } from "../../../types/Insumos";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormNovoInsumoProps {
  setNovoInsumo: Dispatch<SetStateAction<boolean>>;
  setInsumo: () => void;
}

function FormNovoInsumo({ setNovoInsumo, setInsumo }: IFormNovoInsumoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarInsumosBody>({
    resolver: zodResolver(criarInsumosSchema),
    defaultValues: {
      external_id: "",
      estoqueMinimo: "0",
    },
  });

  const onSubmit = async (data: ICriarInsumosBody) => {
    try {
      const { data: res } = await apiClient.post<IInsumos>("/raw-material", {
        external_id: data.external_id.trim() || null,
        nome: data.nome,
        lead_time_medio_entrega: Number(data.leadTimeEntrega),
        custo_medio: parseFloat(data.custoMedio),
        minimum_stock: Number(data.estoqueMinimo),
      });
      toast.success("Insumo criado com sucesso!");
      setInsumo();
      setNovoInsumo(false);
      console.log(res);
    } catch (error) {
      console.error("Erro ao criar insumo:", error);
      const detail = error instanceof AxiosError ? error.response?.data?.detail : null;
      toast.error(
        typeof detail === "string" ? detail : "Erro ao criar insumo. Tente novamente.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-10 my-6"
    >
      <div className="flex gap-4">
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="novo-insumo-id"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            ID
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="novo-insumo-id"
              placeholder="ID do ERP"
              type="text"
              maxLength={120}
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("external_id")}
            />
          </div>
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
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            Material
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="nome"
              placeholder="Nome do material"
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

        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="leadTimeEntrega"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            Lead Time Médio de Entrega (dias)
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="leadTimeEntrega"
              placeholder="Lead Time Médio de Entrega (dias)"
              type="number"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("leadTimeEntrega")}
            />
          </div>
          {errors.leadTimeEntrega && (
            <ErrorMessage
              errors={errors}
              name="leadTimeEntrega"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="custoMedio"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            Custo Médio (R$/Kg)
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="custoMedio"
              placeholder="Custo Médio (R$/Kg)"
              type="number"
              step={0.01}
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("custoMedio")}
            />
          </div>
          {errors.custoMedio && (
            <ErrorMessage
              errors={errors}
              name="custoMedio"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="estoqueMinimo"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            Estoque Mínimo
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="estoqueMinimo"
              placeholder="Estoque Mínimo"
              type="number"
              min={0}
              step="any"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("estoqueMinimo")}
            />
          </div>
          {errors.estoqueMinimo && (
            <ErrorMessage
              errors={errors}
              name="estoqueMinimo"
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

export default FormNovoInsumo;
