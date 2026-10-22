import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { IoSearchSharp } from "react-icons/io5";
import { TbTrash } from "react-icons/tb";
import { VscLoading } from "react-icons/vsc";
import { toast } from "react-toastify";
import { parseBrDecimal } from "../../../schemas/pedido";
import type { IPedido } from "../../../types/Pedido";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";
import FormJobManual from "./formJobManual";
import {
  PRIORIDADES,
  formatarData,
  formatarHora,
  formatarNumero,
  formatarValor,
  nomeCliente,
  nomeProduto,
  numeroPedido,
  pedidoCombinaBusca,
  prioridadePedido,
} from "./pedidoFormat";

interface PedidosDisponiveisProps {
  selecionados: IPedido[];
  onSelecionar: (pedido: IPedido) => void;
  onCatalogo: (pedidos: IPedido[]) => void;
  onApagarSelecao: () => void;
}

function PedidosDisponiveis({
  selecionados,
  onSelecionar,
  onCatalogo,
  onApagarSelecao,
}: PedidosDisponiveisProps) {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [novoJob, setNovoJob] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState<IPedido | null>(null);

  const { data: jobs, isFetching } = useQuery({
    queryKey: ["get", "jobs"],
    queryFn: async () => {
      const { data } = await apiClient.get<IPedido[]>("/jobs");
      return data;
    },
  });

  useEffect(() => {
    if (jobs) onCatalogo(jobs);
  }, [jobs, onCatalogo]);

  const disponiveis = (jobs ?? []).filter(
    (pedido) => !selecionados.some((item) => item.id === pedido.id),
  );
  const visiveis = disponiveis.filter((pedido) => pedidoCombinaBusca(pedido, busca));

  const deletarJob = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/jobs/${id}`);
    },
    onSuccess: async () => {
      toast.success("Pedido deletado com sucesso", { toastId: "deletePedidoToast" });
      await queryClient.invalidateQueries({ queryKey: ["get", "jobs"] });
    },
    onError: () => {
      toast.error("Erro ao deletar pedido", { toastId: "deletePedidoToast" });
    },
  });

  const { mutateAsync: apagarDisponiveis, isPending } = useMutation({
    mutationFn: async () => {
      for (const job of disponiveis) {
        await apiClient.delete(`/jobs/${job.id}`);
      }
    },
  });

  const atualizarCampo = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: number;
      body: { product_value?: number; priority?: number };
    }) => {
      await apiClient.put(`/jobs/${id}`, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["get", "jobs"] });
    },
    onError: (error) => {
      const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
      toast.error(typeof detail === "string" ? detail : "Erro ao atualizar o pedido");
    },
  });

  const deletarTodosJobsFn = async () => {
    try {
      await apagarDisponiveis();
      toast.success("Pedidos deletado com sucesso", {
        toastId: "deleteTodosPedidosToast",
      });
      onApagarSelecao();
      queryClient.setQueryData(["get", "jobs"], []);
      queryClient.setQueryData(["jobs", "para", "sequenciamento"], []);
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar os pedidos", {
        toastId: "deleteTodosPedidosToast",
      });
    }
  };

  return (
    <div className="w-full md:w-[65%] bg-white rounded-md shadow p-4 overflow-x-auto">
      <Modal.Root isVisible={novoJob}>
        <Modal.Container>
          <Modal.Header title="Adicionar job manualmente" onClose={() => setNovoJob(false)} />
          <FormJobManual onClose={() => setNovoJob(false)} />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={pedidoEditando !== null}>
        <Modal.Container>
          <Modal.Header title="Editar job" onClose={() => setPedidoEditando(null)} />
          {pedidoEditando && (
            <FormJobManual pedido={pedidoEditando} onClose={() => setPedidoEditando(null)} />
          )}
        </Modal.Container>
      </Modal.Root>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg md:text-xl text-[#5B85D5] font-bold">Pedidos Disponíveis</h1>
        <span className="text-sm text-gray-500 whitespace-nowrap">{disponiveis.length} pedidos</span>
      </div>
      <div className="flex flex-wrap items-end gap-2 mt-4">
        <div className="relative flex-1 min-w-[180px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearchSharp className="h-4 w-4 text-gray-400" />
          </div>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={() => setNovoJob(true)}
          className="cursor-pointer text-xs md:text-sm px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
        >
          Adicionar job
        </button>
        <button
          type="button"
          disabled={disponiveis.length === 0}
          onClick={deletarTodosJobsFn}
          className="bg-red-700 disabled:bg-red-200 disabled:cursor-default text-xs px-4 py-3 md:text-sm md:px-6 md:py-3 rounded-xl text-white hover:bg-red-600 cursor-pointer transition-colors duration-200"
        >
          {isPending ? <VscLoading size={20} className="animate-spin" /> : "Apagar tudo"}
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[400px] md:h-[470px] overflow-x-auto">
        {isFetching ? (
          <Loader message="Carregando pedidos" />
        ) : disponiveis.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <h2 className="text-lg md:text-2xl text-gray-500 font-semibold">
              Nenhum pedido encontrado !
            </h2>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  "Nº pedido",
                  "Cliente",
                  "Produto",
                  "Demanda",
                  "Data prometida",
                  "Hora prometida",
                  "Valor (R$/un.)",
                  "Prioridade",
                  "Ações",
                ].map((coluna) => (
                  <th
                    key={coluna}
                    className="sticky top-0 z-10 bg-gray-100 px-2 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap"
                  >
                    {coluna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visiveis.map((pedido) => (
                <tr
                  key={pedido.id}
                  onClick={() => onSelecionar(pedido)}
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-black">
                    {numeroPedido(pedido)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-black">
                    {nomeCliente(pedido)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-black">
                    {nomeProduto(pedido)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-black">
                    {formatarNumero(pedido.demand)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-black">
                    {formatarData(pedido.promised_date)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-black">
                    {formatarHora(pedido.promised_date)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                    <ValorInline
                      pedido={pedido}
                      onSalvar={(valor) =>
                        atualizarCampo.mutate({ id: pedido.id, body: { product_value: valor } })
                      }
                    />
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                    <select
                      value={prioridadePedido(pedido) ?? ""}
                      onChange={(event) => {
                        const priority = Number(event.target.value);
                        if (!PRIORIDADES.includes(priority)) return;
                        atualizarCampo.mutate({ id: pedido.id, body: { priority } });
                      }}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs md:text-sm"
                    >
                      {prioridadePedido(pedido) == null && <option value="">—</option>}
                      {prioridadePedido(pedido) != null &&
                        !PRIORIDADES.includes(prioridadePedido(pedido) as number) && (
                          <option value={prioridadePedido(pedido) as number} disabled>
                            {prioridadePedido(pedido)}
                          </option>
                        )}
                      {PRIORIDADES.map((prioridade) => (
                        <option key={prioridade} value={prioridade}>
                          {prioridade}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPedidoEditando(pedido)}
                        className="text-blue-600 cursor-pointer hover:text-blue-800"
                        aria-label="Editar job"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deletarJob.mutate(pedido.id)}
                        className="text-red-500 cursor-pointer hover:text-red-700"
                        aria-label="Excluir job"
                      >
                        <TbTrash className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ValorInline({
  pedido,
  onSalvar,
}: {
  pedido: IPedido;
  onSalvar: (valor: number) => void;
}) {
  const [texto, setTexto] = useState(formatarValor(pedido.product_value));

  useEffect(() => {
    setTexto(formatarValor(pedido.product_value));
  }, [pedido.product_value]);

  const persistir = () => {
    const valor = parseBrDecimal(texto);
    if (valor === null || valor < 0) {
      toast.error("Valor inválido");
      setTexto(formatarValor(pedido.product_value));
      return;
    }
    if (valor === pedido.product_value) return;
    onSalvar(valor);
  };

  return (
    <label className="inline-flex items-center gap-1 text-xs md:text-sm text-black">
      <span>R$</span>
      <input
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
        onBlur={persistir}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-right outline-none"
      />
    </label>
  );
}

export default PedidosDisponiveis;
