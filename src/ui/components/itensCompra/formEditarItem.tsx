import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  editarItensCompraSchema,
  type IEditarItensCompraBody,
} from "../../../schemas/itensCompra";
import type { IItensCompra } from "../../../types/ItensCompra";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormEditarItemProps {
  item: IItensCompra;
  setEditarItem: Dispatch<SetStateAction<boolean>>;
  setItem: () => void;
}

function FormEditarItem({
  item,
  setEditarItem,
  setItem,
}: IFormEditarItemProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<IEditarItensCompraBody>({
    resolver: zodResolver(editarItensCompraSchema),
    defaultValues: {
      custoMedio: item.custoMedio,
      leadTimeEntrega: item.leadTimeEntrega,
      item: item.item,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      await apiClient.put<IItensCompra>(`/itens_compra/${item.id}`, {
        item: data.item,
        leadTimeEntrega: Number(data.leadTimeEntrega),
        custoMedio: Number(data.custoMedio),
      });
      setItem();
      toast.success("Item atualizado com sucesso!");
      setEditarItem(false);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast.error("Erro ao atualizar item. Tente novamente.");
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
            Item
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="nome"
              placeholder="Nome do item"
              type="text"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("item")}
            />
          </div>
          {errors.item && (
            <ErrorMessage
              errors={errors}
              name="item"
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

export default FormEditarItem;
