import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useEffect, useState, type ReactNode } from "react";
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

function rotuloCliente(cliente: ICliente) {
  const codigo = cliente.external_id?.trim();
  return codigo ? `${codigo} — ${cliente.name}` : cliente.name;
}

function rotuloProduto(produto: IProduto) {
  const codigo = produto.external_id?.trim();
  return codigo ? `${codigo} — ${produto.name}` : produto.name;
}

function CampoBusca<T extends { id: number }>({
  label,
  error,
  placeholder,
  itens,
  rotulo,
  valorId,
  onEscolher,
}: {
  label: string;
  error?: string;
  placeholder: string;
  itens: T[];
  rotulo: (item: T) => string;
  valorId: string;
  onEscolher: (id: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const [aberto, setAberto] = useState(false);
  const selecionado = itens.find((item) => String(item.id) === valorId);
  const rotuloSelecionado = selecionado ? rotulo(selecionado) : "";
  const termo = texto.trim().toLowerCase();
  const filtrando = aberto && texto !== rotuloSelecionado;
  const visiveis = [...itens]
    .sort((a, b) => rotulo(a).localeCompare(rotulo(b), "pt-BR"))
    .filter((item) => !filtrando || rotulo(item).toLowerCase().includes(termo));

  useEffect(() => {
    if (!aberto && rotuloSelecionado) {
      setTexto(rotuloSelecionado);
    }
  }, [aberto, rotuloSelecionado]);

  return (
    <Campo label={label} error={error}>
      <input
        type="text"
        value={texto}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setAberto(true)}
        onBlur={() => {
          window.setTimeout(() => setAberto(false), 120);
        }}
        onChange={(event) => {
          const proximo = event.target.value;
          setTexto(proximo);
          setAberto(true);
          if (proximo !== rotuloSelecionado) {
            onEscolher("");
          }
        }}
        className="w-full rounded-lg border border-gray-300 p-2 outline-none"
      />
      {aberto && (
        <ul className="max-h-40 overflow-auto rounded-lg border border-gray-200 bg-white">
          {visiveis.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">Nenhum resultado</li>
          ) : (
            visiveis.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-blue-50"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onEscolher(String(item.id));
                    setTexto(rotulo(item));
                    setAberto(false);
                  }}
                >
                  {rotulo(item)}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </Campo>
  );
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
    setValue,
    watch,
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
      order_number: pedido?.order_number ?? "",
    },
  });

  const clienteSelecionado = watch("fk_id_client");
  const produtoSelecionado = watch("fk_id_product");

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
      order_number: data.order_number.trim(),
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
        toast.success("Pedido adicionado com sucesso");
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
            : "Erro ao adicionar o pedido",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full min-w-[280px] md:min-w-[520px] flex flex-col gap-4 my-4">
      <Campo label="Número do pedido" error={errors.order_number?.message}>
        <input
          type="text"
          placeholder="Número do pedido"
          className="w-full rounded-lg border border-gray-300 p-2 outline-none"
          {...register("order_number")}
        />
      </Campo>

      <CampoBusca
        label="Cliente"
        error={errors.fk_id_client?.message}
        placeholder="Digite o código externo do cliente"
        itens={clientes}
        rotulo={rotuloCliente}
        valorId={clienteSelecionado}
        onEscolher={(id) => setValue("fk_id_client", id, { shouldValidate: true })}
      />

      <CampoBusca
        label="Produto"
        error={errors.fk_id_product?.message}
        placeholder="Digite o código externo do produto"
        itens={produtos}
        rotulo={rotuloProduto}
        valorId={produtoSelecionado}
        onEscolher={(id) => setValue("fk_id_product", id, { shouldValidate: true })}
      />

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
          title={editando ? "Salvar alterações" : "Adicionar pedido"}
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
