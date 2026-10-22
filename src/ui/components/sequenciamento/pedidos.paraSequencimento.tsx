import { useEffect, useState } from "react";
import { IoClose, IoSearchSharp } from "react-icons/io5";
import { useAuth } from "../../../hooks/useAuth";
import type { IPedido } from "../../../types/Pedido";
import {
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

interface PedidosParaSequenciamentoProps {
  setStartSteps?: (value: boolean) => void;
  pedidos: IPedido[];
  onRemover: (pedido: IPedido) => void;
}

function PedidosParaSequenciamento({
  setStartSteps,
  pedidos,
  onRemover,
}: PedidosParaSequenciamentoProps) {
  const [busca, setBusca] = useState<string>("");
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { user_id } = useAuth();

  const connectToSSE = () => {
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL as string;
      const sseUrl = `${baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL}/sequenciamento/stream?user_id=${user_id}`;

      const newEventSource = new EventSource(sseUrl);

      newEventSource.onopen = () => {
        console.log("SSE connection established");
      };

      newEventSource.onmessage = (event) => {
        try {
          console.log("Evento recebido", event.data);
          const data = JSON.parse(event.data) as { finished: boolean };
          const isFinished = data.finished === true;
          if (isFinished) {
            newEventSource.close();
            setEventSource(null);
            setIsProcessing(false);
          } else {
            setIsProcessing(true);
          }
        } catch (error) {
          console.error("Erro ao processar mensagem SSE:", error);
          setIsProcessing(false);
        }
      };

      newEventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        newEventSource.close();
        setEventSource(null);
      };

      setEventSource(newEventSource);
    } catch (error) {
      console.error("Erro ao conectar ao SSE:", error);
    }
  };

  useEffect(() => {
    connectToSSE();
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const lista = (pedidos ?? []).filter((pedido) => pedidoCombinaBusca(pedido, busca));

  return (
    <div className="max-w-full md:flex-1 flex flex-col justify-between bg-white rounded-md shadow p-4 overflow-y-auto overflow-x-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-lg md:text-xl text-[#5B85D5] font-bold">
          Pedidos Para o Sequenciamento ({pedidos ? pedidos.length : 0}/30)
        </h1>

        <div className="relative max-w-md mt-4">
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

        <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[300px]">
          {!pedidos || pedidos.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center">
              <h2 className="text-gray-500 font-semibold">
                Nenhum pedido encontrado !
              </h2>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {lista.map((pedido) => (
                <li key={pedido.id}>
                  <div
                    onClick={() => onRemover(pedido)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Pedido {numeroPedido(pedido)} · {nomeProduto(pedido)}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{nomeCliente(pedido)}</p>
                      <p className="text-xs text-gray-600">
                        {formatarNumero(pedido.demand)} unidades · {formatarData(pedido.promised_date)}{" "}
                        {formatarHora(pedido.promised_date)}
                      </p>
                      <p className="text-xs text-gray-600">
                        R$ {formatarValor(pedido.product_value)} · Prioridade{" "}
                        {prioridadePedido(pedido) ?? "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Remover do sequenciamento"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemover(pedido);
                      }}
                      className="text-gray-500 hover:text-gray-800 cursor-pointer p-1"
                    >
                      <IoClose size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        disabled={!pedidos || pedidos.length === 0 || isProcessing}
        onClick={() => {
          if (setStartSteps) {
            localStorage.setItem(
              "jobs_ids",
              JSON.stringify(pedidos?.map((p) => p.id)),
            );
            setStartSteps(true);
          }
        }}
        className="w-1/2 md:w-full text-xs  cursor-pointer inline-flex items-center justify-center md:text-lg p-1 bg-blue-600 disabled:bg-gray-400 disabled:cursor-default hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isProcessing
          ? "Sequenciamento ainda está sendo processado..."
          : "Iniciar Sequenciamento"}
      </button>
    </div>
  );
}

export default PedidosParaSequenciamento;
