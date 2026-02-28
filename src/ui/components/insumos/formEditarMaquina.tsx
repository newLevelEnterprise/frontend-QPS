import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  editarInsumosSchema,
  type IEditarInsumosBody,
} from "../../../schemas/insumos";
import type { IInsumos } from "../../../types/Insumos";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormEditarInsumoProps {
  insumo: {
    id: number;
    nome: string;
    lead_time_medio_entrega: number;
    custo_medio: string;
  };
  setEditarInsumo: Dispatch<SetStateAction<boolean>>;
  setInsumo: () => void;
}

function FormEditarInsumo({
  insumo,
  setEditarInsumo,
  setInsumo,
}: IFormEditarInsumoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<IEditarInsumosBody>({
    resolver: zodResolver(editarInsumosSchema),
    defaultValues: {
      custoMedio: insumo.custo_medio,
      leadTimeEntrega: insumo.lead_time_medio_entrega,
      nome: insumo.nome,
    },
  });

  const onSubmit = async (data: IEditarInsumosBody) => {
    try {
      await apiClient.put<IInsumos>(`/raw-material/${insumo.id}`, {
        nome: data.nome,
        lead_time_medio_entrega: Number(data.leadTimeEntrega),
        custo_medio: Number(data.custoMedio),
      });
      setInsumo();
      toast.success("Insumo atualizado com sucesso!");
      setEditarInsumo(false);
    } catch (error) {
      console.error("Erro ao atualizar insumo:", error);
      toast.error("Erro ao atualizar insumo. Tente novamente.");
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
            htmlFor="disponibilidade"
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

export default FormEditarInsumo;
