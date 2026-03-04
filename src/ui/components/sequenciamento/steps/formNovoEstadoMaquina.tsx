import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type { ICriaStepsSequenciamentoBody } from "../../../../schemas/steps";
import type { IMaquinasType } from "../../../../types/Maquina";
import type { IMoldes } from "../../../../types/Moldes";
import { apiClient } from "../../../../utils/apiClient";

interface IProdutoComMoldes {
  name: string;
  id: number;
  molds: Array<number | { id: number }>;
  raw_materials: unknown[];
  purchase_items: unknown[];
}

type IEstadoAtualMaquinaItem =
  ICriaStepsSequenciamentoBody["estadoAtualMaquina"][number];

const defaultNovoEstado: IEstadoAtualMaquinaItem = {
  production_line_id: "",
  maquina: "",
  utilizacao: false,
  codMolde: "",
  prodMaquinaInicioSequenciamento: "",
  nome_cliente: "",
  status: "Concluido",
  numeroPedido: "",
  tempoRestanteProdInjetora: "",
  tempoRestanteProdPosInjetora: "",
  demanda: "",
  valorAFAturar: "",
  dataLimiteFaturamento: "",
  horarioLimiteFaturamento: "",
};

const disabledFieldClassName =
  "disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed";

interface IFormNovoEstadoProps {
  onAddEstadoAtualMaquina: (data: IEstadoAtualMaquinaItem) => void;
  setIsModalNovoEstadoVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

function FormNovoEstado({
  onAddEstadoAtualMaquina,
  setIsModalNovoEstadoVisible,
}: IFormNovoEstadoProps) {
  const { data: moldes, isFetching: isFetchingMoldes } = useQuery({
    queryKey: ["get", "all", "moldes"],
    queryFn: async () => {
      const { data } = await apiClient.get<IMoldes[]>("/molds/");
      return data;
    },
  });

  const { data: produtos, isFetching: isFetchingProdutos } = useQuery({
    queryKey: ["get", "all", "products"],
    queryFn: async () => {
      const { data } = await apiClient.get<IProdutoComMoldes[]>("/products/");
      return data;
    },
  });

  const { data: maquinas, isFetching: isFetchingMaquinas } = useQuery({
    queryKey: ["get", "all", "machines"],
    queryFn: async () => {
      const { data } = await apiClient.get<IMaquinasType[]>("/machines/");
      return data;
    },
  });

  const { data: clientes, isFetching: isFetchingClients } = useQuery({
    queryKey: ["get", "all", "clients"],
    queryFn: async () => {
      const { data } = await apiClient.get<IMaquinasType[]>("/clients/");
      return data;
    },
  });

  const { data: compositionLines, isFetching: isFetchingCompositionLines } =
    useQuery({
      queryKey: ["get", "all", "compositionLines"],
      queryFn: async () => {
        const { data } = await apiClient.get<
          {
            product_id: number;
            production_line_id: number;
            product: { name: string; id: number };
          }[]
        >("/composition-lines/");
        return data;
      },
    });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<IEstadoAtualMaquinaItem>({
    defaultValues: defaultNovoEstado,
  });

  const maquinaSelecionada = watch("maquina");
  const moldeSelecionadoId = watch("codMolde");
  const produtoSelecionado = watch("prodMaquinaInicioSequenciamento");
  const statusSelecionado = watch("status");

  const camposBloqueadosPorConcluido = statusSelecionado === "Concluido";

  const produtosDoMoldeSelecionado = useMemo(() => {
    if (!moldeSelecionadoId) {
      return [];
    }

    return (
      produtos?.filter((produto) =>
        produto.molds?.some((mold) => {
          const moldId = typeof mold === "number" ? mold : mold.id;
          return String(moldId) === moldeSelecionadoId;
        }),
      ) || []
    );
  }, [produtos, moldeSelecionadoId]);

  useEffect(() => {
    setValue("codMolde", "");
    setValue("prodMaquinaInicioSequenciamento", "");
  }, [maquinaSelecionada, setValue]);

  useEffect(() => {
    setValue("prodMaquinaInicioSequenciamento", "");
  }, [moldeSelecionadoId, setValue]);

  useEffect(() => {
    if (statusSelecionado === "Concluido") {
      setValue("numeroPedido", "");
      setValue("utilizacao", false);
      setValue("tempoRestanteProdInjetora", "");
      setValue("tempoRestanteProdPosInjetora", "");
      setValue("demanda", "");
      setValue("valorAFAturar", "");
      setValue("dataLimiteFaturamento", "");
      setValue("horarioLimiteFaturamento", "");
    }
  }, [setValue, statusSelecionado]);

  const adicionarEstadoAtualMaquina = (data: IEstadoAtualMaquinaItem) => {
    const productLineId = compositionLines?.find(
      (line) => line.product.name === data.prodMaquinaInicioSequenciamento,
    );
    if (!productLineId || !productLineId.production_line_id) {
      toast.error(
        "Não foi possível encontrar a linha de produção para o produto selecionado. Verifique se o produto está corretamente associado a uma linha de produção.",
      );
      return;
    }
    data.production_line_id = productLineId.production_line_id.toString() || "";
    onAddEstadoAtualMaquina(data);
    reset(defaultNovoEstado);
    setIsModalNovoEstadoVisible(false);
  };

  return (
    <form
      onSubmit={handleSubmit(adicionarEstadoAtualMaquina)}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Máquina</label>
        <select
          className={`border rounded px-2 py-1 ${disabledFieldClassName}`}
          defaultValue=""
          {...register("maquina", { required: true })}
          disabled={isFetchingMaquinas || isFetchingCompositionLines}
        >
          <option value="" disabled>
            {isFetchingMaquinas
              ? "Carregando máquinas..."
              : "Selecione uma máquina"}
          </option>
          {maquinas?.map((maquina) => (
            <option key={maquina.id} value={maquina.name}>
              {maquina.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Código do Molde</label>
        <select
          className={`border rounded px-2 py-1 ${disabledFieldClassName}`}
          {...register("codMolde", { required: true })}
          disabled={!maquinaSelecionada || isFetchingMoldes}
          defaultValue=""
        >
          <option value="" disabled>
            {!maquinaSelecionada
              ? "Selecione uma máquina primeiro"
              : isFetchingMoldes
                ? "Carregando moldes..."
                : "Selecione um molde"}
          </option>
          {moldes?.map((molde) => (
            <option key={molde.id} value={String(molde.id)}>
              {molde.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Produto na Máquina</label>
        <select
          className={`border rounded px-2 py-1 ${disabledFieldClassName}`}
          {...register("prodMaquinaInicioSequenciamento", {
            required: true,
          })}
          disabled={!moldeSelecionadoId || isFetchingProdutos}
          defaultValue=""
        >
          <option value="" disabled>
            {!moldeSelecionadoId
              ? "Selecione um molde primeiro"
              : isFetchingProdutos
                ? "Carregando produtos..."
                : "Selecione um produto"}
          </option>
          {produtosDoMoldeSelecionado.map((produto) => (
            <option key={produto.id} value={produto.name}>
              {produto.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Status do Pedido</label>
        <select
          className={`border rounded px-2 py-1 ${disabledFieldClassName}`}
          {...register("status", { required: true })}
          disabled={!produtoSelecionado}
        >
          <option value="Concluido">Concluido</option>
          <option value="Não concluido">Não concluido</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Número do Pedido</label>
        <input
          type="text"
          className={`border rounded px-2 py-1 ${disabledFieldClassName}`}
          {...register("numeroPedido", {
            validate: (value) =>
              statusSelecionado === "Concluido" ||
              (value || "").trim().length > 0 ||
              "Número do Pedido é obrigatório",
          })}
          disabled={camposBloqueadosPorConcluido}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Nome do Cliente</label>
        <select
          className={`border rounded px-2 py-1 ${disabledFieldClassName}`}
          {...register("nome_cliente", {
            validate: (value) =>
              statusSelecionado === "Concluido" ||
              (value || "").trim().length > 0 ||
              "Nome do Cliente é obrigatório",
          })}
          defaultValue=""
          disabled={camposBloqueadosPorConcluido || isFetchingClients}
        >
          <option value="" disabled>
            {isFetchingClients
              ? "Carregando clientes..."
              : "Selecione um cliente"}
          </option>
          {clientes?.map((cliente) => (
            <option key={cliente.id} value={cliente.name}>
              {cliente.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Utilização</label>
        <label className="flex items-center gap-2 h-[34px]">
          <input
            type="checkbox"
            className="accent-[#5B85D5] disabled:opacity-50 disabled:cursor-not-allowed"
            {...register("utilizacao")}
            disabled={camposBloqueadosPorConcluido}
          />
          Em utilização
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">
          Tempo restante na Injetora (min)
        </label>
        <input
          type="number"
          className={`border rounded px-2 py-1 ${disabledFieldClassName}`}
          {...register("tempoRestanteProdInjetora")}
          disabled={camposBloqueadosPorConcluido}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">
          Tempo restante pós Injetora (min)
        </label>
        <input
          type="number"
          className={`border rounded px-2 py-1 ${disabledFieldClassName}`}
          {...register("tempoRestanteProdPosInjetora")}
          disabled={camposBloqueadosPorConcluido}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Demanda</label>
        <input
          type="number"
          className={`border rounded px-2 py-1 ${disabledFieldClassName}`}
          {...register("demanda")}
          disabled={camposBloqueadosPorConcluido}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Valor a Faturar</label>
        <input
          type="number"
          className={`border rounded px-2 py-1 ${disabledFieldClassName}`}
          {...register("valorAFAturar")}
          disabled={camposBloqueadosPorConcluido}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">
          Data Limite de Faturamento
        </label>
        <input
          type="date"
          className={`border rounded px-2 py-1 ${disabledFieldClassName}`}
          {...register("dataLimiteFaturamento")}
          disabled={camposBloqueadosPorConcluido}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">
          Horário Limite de Faturamento
        </label>
        <input
          type="time"
          className={`border rounded px-2 py-1 ${disabledFieldClassName}`}
          {...register("horarioLimiteFaturamento")}
          disabled={camposBloqueadosPorConcluido}
        />
      </div>

      <div className="md:col-span-2 flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={() => {
            reset(defaultNovoEstado);
            setIsModalNovoEstadoVisible(false);
          }}
          className="px-4 py-2 rounded bg-gray-600 text-white cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}

export default FormNovoEstado;
