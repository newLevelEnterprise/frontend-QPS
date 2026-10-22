import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useEffect, type ReactNode } from "react";
import { toast } from "react-toastify";
import {
  JOB_PRIORITIES,
  jobManualSchema,
  parseBrDecimal,
  type IJobManualBody,
} from "../../../schemas/pedido";
import type { ICliente } from "../../../types/Cliente";
import type { IPedido } from "../../../types/Pedido";
import type { IProduto } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";
import {
  dividirDataHora,
  formatarValor,
  nomeCliente,
  nomeProduto,
  prioridadePedido,
} from "./pedidoFormat";

interface FormJobManualProps {
  pedido?: IPedido;
  onClose: () => void;
}

function FormJobManual({ pedido, onClose }: FormJobManualProps) {
  const queryClient = useQueryClient();
  const editando = Boolean(pedido);
  const dataHora = dividirDataHora(pedido?.promised_date ?? "");
  const prioridadeAtual = pedido ? prioridadePedido(pedido) : null;

  const { data: clientes = [] } = useQuery({
    queryKey: ["get", "all", "clients"],
    queryFn: async () => {
      const { data } = await apiClient.get<ICliente[]>("/clients/");
      return data;
    },
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["get", "commercial", "products"],
    queryFn: async () => {
      const { data } = await apiClient.get<IProduto[]>("/products/commercial");
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = useForm<IJobManualBody>({
    resolver: zodResolver(jobManualSchema),
    mode: "onChange",
    defaultValues: {
      fk_id_client: pedido?.fk_id_client ? String(pedido.fk_id_client) : "",
      fk_id_product: pedido?.fk_id_product ? String(pedido.fk_id_product) : "",
      demand: pedido ? String(pedido.demand) : "",
      product_value: pedido ? formatarValor(pedido.product_value) : "",
      promised_date: dataHora.date,
      promised_hour: dataHora.time,
      priority:
        prioridadeAtual != null && JOB_PRIORITIES.includes(String(prioridadeAtual) as (typeof JOB_PRIORITIES)[number])
          ? (String(prioridadeAtual) as IJobManualBody["priority"])
          : undefined,
    },
  });

  useEffect(() => {
    if (editando) {
      void trigger();
    }
  }, [editando, trigger]);

  const onSubmit = async (data: IJobManualBody) => {
    const cliente = clientes.find((item) => item.id === Number(data.fk_id_client));
    const produto = produtos.find((item) => item.id === Number(data.fk_id_product));
    const payload = {
      fk_id_client: Number(data.fk_id_client),
      fk_id_product: Number(data.fk_id_product),
      product_name: `${cliente?.name ?? nomeCliente(pedido as IPedido)} - ${produto?.name ?? (pedido ? nomeProduto(pedido) : "")}`,
      demand: Number(data.demand),
      product_value: parseBrDecimal(data.product_value),
      promised_date: `${data.promised_date}T${data.promised_hour}:00`,
      priority: Number(data.priority),
      processed: false,
    };

    try {
      if (pedido) {
        await apiClient.put(`/jobs/${pedido.id}`, payload);
        toast.success("Pedido atualizado com sucesso");
      } else {
        await apiClient.post("/jobs", payload);
        toast.success("Job adicionado com sucesso");
      }
      await queryClient.invalidateQueries({ queryKey: ["get", "jobs"] });
      onClose();
    } catch (error) {
      const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
      toast.error(
        typeof detail === "string" && detail.trim()
          ? detail
          : editando
            ? "Erro ao atualizar o pedido"
            : "Erro ao adicionar o job",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full min-w-[280px] md:min-w-[520px] flex flex-col gap-4 my-4">
      <Campo label="Cliente" error={errors.fk_id_client?.message}>
        <select
          className="w-full rounded-lg border border-gray-300 p-2 outline-none"
          {...register("fk_id_client")}
        >
          <option value="">Selecione</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.name}
            </option>
          ))}
        </select>
      </Campo>

      <Campo label="Produto" error={errors.fk_id_product?.message}>
        <select
          className="w-full rounded-lg border border-gray-300 p-2 outline-none"
          {...register("fk_id_product")}
        >
          <option value="">Selecione</option>
          {produtos.map((produto) => (
            <option key={produto.id} value={produto.id}>
              {produto.name}
            </option>
          ))}
        </select>
      </Campo>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Campo label="Demanda" error={errors.demand?.message}>
          <input
            type="number"
            min={1}
            step={1}
            className="w-full rounded-lg border border-gray-300 p-2 outline-none"
            {...register("demand")}
          />
        </Campo>
        <Campo label="Valor (R$/un.)" error={errors.product_value?.message}>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            className="w-full rounded-lg border border-gray-300 p-2 outline-none"
            {...register("product_value")}
          />
        </Campo>
        <Campo label="Data prometida" error={errors.promised_date?.message}>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 p-2 outline-none"
            {...register("promised_date")}
          />
        </Campo>
        <Campo label="Hora prometida" error={errors.promised_hour?.message}>
          <input
            type="time"
            className="w-full rounded-lg border border-gray-300 p-2 outline-none"
            {...register("promised_hour")}
          />
        </Campo>
      </div>

      <Campo label="Prioridade" error={errors.priority?.message}>
        <select
          className="w-full rounded-lg border border-gray-300 p-2 outline-none"
          {...register("priority")}
        >
          <option value="">Selecione</option>
          {JOB_PRIORITIES.map((prioridade) => (
            <option key={prioridade} value={prioridade}>
              {prioridade}
            </option>
          ))}
        </select>
      </Campo>

      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer px-6 py-2 rounded-full border border-gray-300 text-gray-700"
        >
          Cancelar
        </button>
        <Button
          title={editando ? "Salvar alterações" : "Adicionar job"}
          type="submit"
          disable={isSubmitting || !isValid}
          isLoading={isSubmitting}
        />
      </div>
    </form>
  );
}

function Campo({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-[#212A4F] font-semibold text-sm">{label}</label>
      {children}
      {error && (
        <ErrorMessage
          errors={{ field: { message: error } }}
          name="field"
          render={({ message }) => <FormErrorMessage message={message} />}
        />
      )}
    </div>
  );
}

export default FormJobManual;
