import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import type { IPedido } from "../../../types/Pedido";
import { apiClient } from "../../../utils/apiClient";
import Modal from "../modal";
import Loading from "./loading";

function PedidosParaSequenciamento() {
  const queryClient = useQueryClient();
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [pedidoFinalizado, setPedidoFinalizado] = useState<boolean>(false);
  const [processamentoEmAndamento, setProcessamentoEmAndamento] =
    useState<boolean>(false);
  const [busca, setBusca] = useState<string>("");
  const [dataDoPedido, setDataDoPedido] = useState<string>(
    new Date().toISOString()
  );
  const [horario, setHorario] = useState<string>("");
  const [maquinasDisponiveis, setMaquinasDisponiveis] = useState<number>(100);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { user_id } = useAuth();

  const connectToSSE = () => {
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL;
      const sseUrl = `${baseURL}/sequenciamento/sequenciamento/stream?user_id=${user_id}`;

      const newEventSource = new EventSource(sseUrl);

      newEventSource.onopen = () => {
        console.log("SSE connection established");
      };

      newEventSource.onmessage = (event) => {
        try {
          console.log("Evento recebido", event.data);
          const data = event.data;
          const isFinished = data === "true";
          if (isFinished) {
            setPedidoFinalizado(true);
            setProcessamentoEmAndamento(false);

            newEventSource.close();
            setEventSource(null);
          } else {
            setPedidoFinalizado(false);
            setProcessamentoEmAndamento(true);
          }
        } catch (error) {
          console.error("Erro ao processar mensagem SSE:", error);
        }
      };

      newEventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        newEventSource.close();
        setEventSource(null);
        setProcessamentoEmAndamento(false);
        setPedidoFinalizado(false);
      };

      setEventSource(newEventSource);
    } catch (error) {
      console.error("Erro ao conectar ao SSE:", error);
      setProcessamentoEmAndamento(false);
      setPedidoFinalizado(true);
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

  const {data: pedidos} = useQuery({
    queryKey: ["jobs", "para", "sequenciamento"],
    queryFn: () => {
      const jsonItens = localStorage.getItem("jobs_para_sequenciamento");
      if (!jsonItens) {
        return queryClient.getQueryData(["jobs", "para", "sequenciamento"]) as IPedido[];
      }
      const jobsParaSequenciamento = JSON.parse(jsonItens) as IPedido[];

      return jobsParaSequenciamento as IPedido[];
    }
  });

  const handleVoltarPedido = (pedido: IPedido) => {
    queryClient.setQueryData(["get", "jobs"], (actualData: IPedido[]) => {
      if (!actualData) return actualData;
      return [...actualData, pedido]
    });
    queryClient.setQueryData(["jobs", "para", "sequenciamento"], (oldData: IPedido[]) => {
      if (!oldData) return oldData;
      const oldOrders = [...oldData];
      const index = oldOrders.findIndex((p) => p.id === pedido.id);
      oldOrders.splice(index, 1);
      localStorage.setItem("jobs_para_sequenciamento", JSON.stringify(oldOrders));
      return oldOrders;
    });
  };

  const iniciarSequenciamentoFunc = async () => {
    try {
      setIsloading(true);

      if (!pedidoFinalizado) {
        toast.error("O processamento ainda não foi finalizado !");
        return;
      }

      if (maquinasDisponiveis > 100 || maquinasDisponiveis < 1) {
        toast.error("O número de máquinas disponíveis deve ser entre 0 e 100.");
        return;
      }

      const dataPedido = `${dataDoPedido}T${horario}`;
      await apiClient.post(
        `/sequenciamento/sequenciamento/solve?sequencing_date=${dataPedido}&machine_availability=${maquinasDisponiveis}`,
        pedidos?.map((p) => p.id)
      );

      if (!eventSource) {
        connectToSSE();
      }
      setPedidoFinalizado(false);
      setProcessamentoEmAndamento(true);
      queryClient.setQueryData(["jobs", "para", "sequenciamento"], () => {
        return [];
      });
      localStorage.removeItem("jobs_para_sequenciamento");
      toast.success("Sequenciamento iniciado com sucesso!");
    } catch (error) {
      console.log(error);
      setProcessamentoEmAndamento(false);
      toast.error("Erro ao iniciar o sequenciamento. Tente novamente.");
    } finally {
      setIsloading(false);
    }
  };

  return (
    <div className="w-full md:flex-1 bg-white rounded-md shadow p-4 overflow-y-auto overflow-x-auto">
      <Modal.Root isVisible={isLoading}>
        <Modal.Container>
          <Loading />
        </Modal.Container>
      </Modal.Root>

      <h1 className="text-lg md:text-xl text-[#5B85D5] font-bold">
        Pedidos Para o Sequenciamento
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
        {(!pedidos || pedidos.length === 0) ? (
          <div className="w-full h-full flex justify-center items-center">
            <h2 className="text-lg md:text-2xl text-gray-500 font-semibold">
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto">
              {pedidos.filter(p => p.name.includes(busca)).map((pedido) => (
                <tr
                  key={pedido.id}
                  onClick={() => handleVoltarPedido(pedido)}
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                    {pedido.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                    {pedido.product_value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                    {pedido.demand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                     {Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                      }).format(new Date(pedido.promised_date))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                    {pedido.product_value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex gap-4 flex-col w-full justify-center mt-6">
        <div className="w-full flex flex-col items-center gap-10">
          <div className="w-full flex flex-col gap-2 relative">
            <label
              htmlFor="maquinas-disponiveis"
              className="text-sm md:text-base"
            >
              Disponibilidade de máquina (em %)
            </label>
            <input
              id="maquinas-disponiveis"
              type="number"
              min={1}
              max={100}
              value={maquinasDisponiveis}
              onChange={(e) => setMaquinasDisponiveis(Number(e.target.value))}
              className="w-full outline-none border-b border-[#A4AABC]"
            />
            <span className="absolute right-4 bottom-2 text-xs">%</span>
          </div>
          <div className="flex justify-between w-full gap-10">
            <div className="w-1/3 flex flex-col gap-2 relative">
              <label htmlFor="horario" className="text-sm md:text-base">
                Horario
              </label>
              <input
                id="horario"
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full outline-none border-b border-[#A4AABC]"
              />
            </div>
            <div className="w-full flex flex-col gap-2">
              <label htmlFor="data-pedido" className="text-sm md:text-base">
                Data do Pedido
              </label>
              <input
                id="data-pedido"
                type="date"
                value={dataDoPedido}
                onChange={(e) => setDataDoPedido(e.target.value)}
                className="w-full outline-none border-b border-[#A4AABC]"
              />
            </div>
          </div>
        </div>
        <button
          disabled={
            isLoading ||
            (!pedidos || pedidos.length === 0) ||
            !dataDoPedido ||
            !maquinasDisponiveis ||
            processamentoEmAndamento ||
            !pedidoFinalizado ||
            !horario
          }
          onClick={iniciarSequenciamentoFunc}
          className="w-1/2 md:w-full text-sm  cursor-pointer inline-flex items-center justify-center md:text-lg px-2 py-2 bg-green-600 disabled:bg-gray-400 disabled:cursor-default hover:bg-green-700 text-white font-medium rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {processamentoEmAndamento ? "Processando..." : "Iniciar"}
        </button>
      </div>
    </div>
  );
}

export default PedidosParaSequenciamento;
