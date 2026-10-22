import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  criarItensCompraSchema,
  type ICriarItensCompraBody,
} from "../../../schemas/itensCompra";
import type { IInsumos } from "../../../types/Insumos";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormNovoItemProps {
  setNovoItem: Dispatch<SetStateAction<boolean>>;
  setItem: () => void;
}

function FormNovoItem({ setNovoItem, setItem }: IFormNovoItemProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarItensCompraBody>({
    resolver: zodResolver(criarItensCompraSchema),
    defaultValues: {
      external_id: "",
      estoqueMinimo: "0",
    },
  });

  const onSubmit = async (data: ICriarItensCompraBody) => {
    try {
      if (isNaN(parseFloat(data.custoMedio))) {
        toast.error("Custo Médio deve ser um número válido.");
        return;
      }
      if (parseFloat(data.custoMedio) < 0) {
        toast.error("Custo Médio deve ser entre 0 e 100.");
        return;
      }
      const { data: res } = await apiClient.post<IInsumos>("/purchase-items", {
        external_id: data.external_id.trim() || null,
        name: data.item,
        lead_time: Number(data.leadTimeEntrega),
        cost: parseFloat(data.custoMedio),
        scrap: parseFloat(data.refugo),
        minimum_stock: Number(data.estoqueMinimo),
      });
      toast.success("Insumo criado com sucesso!");
      setItem();
      setNovoItem(false);
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
      <div className="flex flex-col gap-4">
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="novo-item-id"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            ID
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="novo-item-id"
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

        <div className="flex gap-2">
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
              Custo Médio (R$/Un)
            </label>
            <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
              <input
                id="custoMedio"
                placeholder="Custo Médio (R$/Un)"
                type="number"
                step={0.01}
                min={0}
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
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="refugo"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            % Refugo
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="refugo"
              placeholder="Refugo"
              type="number"
              step={0.01}
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("refugo")}
            />
          </div>
          {errors.refugo && (
            <ErrorMessage
              errors={errors}
              name="refugo"
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

export default FormNovoItem;
