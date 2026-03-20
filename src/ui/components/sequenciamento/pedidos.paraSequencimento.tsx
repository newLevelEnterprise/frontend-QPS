import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { useAuth } from "../../../hooks/useAuth";
import type { IPedido } from "../../../types/Pedido";

interface PedidosParaSequenciamentoProps {
  setStartSteps?: (value: boolean) => void;
}

function PedidosParaSequenciamento({
  setStartSteps,
}: PedidosParaSequenciamentoProps) {
  const queryClient = useQueryClient();
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

  const { data: pedidos } = useQuery({
    queryKey: ["jobs", "para", "sequenciamento"],
    queryFn: () => {
      const jsonItens = localStorage.getItem("jobs_para_sequenciamento");
      if (!jsonItens) {
        return queryClient.getQueryData([
          "jobs",
          "para",
          "sequenciamento",
        ]) as IPedido[];
      }
      const jobsParaSequenciamento = JSON.parse(jsonItens) as IPedido[];

      return jobsParaSequenciamento as IPedido[];
    },
  });

  const handleVoltarPedido = (pedido: IPedido) => {
    queryClient.setQueryData(["get", "jobs"], (actualData: IPedido[]) => {
      if (!actualData) return actualData;
      return [...actualData, pedido];
    });
    queryClient.setQueryData(
      ["jobs", "para", "sequenciamento"],
      (oldData: IPedido[]) => {
        if (!oldData) return oldData;
        const oldOrders = [...oldData];
        const index = oldOrders.findIndex((p) => p.id === pedido.id);
        oldOrders.splice(index, 1);
        localStorage.setItem(
          "jobs_para_sequenciamento",
          JSON.stringify(oldOrders),
        );
        return oldOrders;
      },
    );
  };

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

        <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[300px] md:h-[300px] overflow-x-auto">
          {!pedidos || pedidos.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center">
              <h2 className="text-gray-500 font-semibold">
                Nenhum pedido encontrado !
              </h2>
            </div>
          ) : (
            <table className="w-full overflow-x-auto">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-3 py-2 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-3 py-2 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Demanda
                  </th>
                  <th className="px-3 py-2 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Data Prometida
                  </th>
                  <th className="px-3 py-2 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="sticky top-0 z-10 bg-gray-100 px-1 py-2 text-center text-xs text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Prioridade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto overflow-x-scroll">
                {pedidos
                  .filter((p) => p.product_name.includes(busca))
                  .map((pedido) => (
                    <tr
                      key={pedido.id}
                      onClick={() => handleVoltarPedido(pedido)}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                        {pedido.product_name.split(" - ")[0]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                        {pedido.product_name.split(" - ")[1]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                        {Intl.NumberFormat("pt-br").format(pedido.demand)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                        {Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "short",
                        }).format(new Date(pedido.promised_date))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                        {Intl.NumberFormat("pt-br", {
                          style: "currency",
                          currency: "BRL",
                        }).format(pedido.product_value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs md:text-sm text-black truncate text-ellipsis">
                        {pedido.client ? pedido.client.priority : "N/A"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
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
