import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import type { IPedido } from "../../../types/Pedido";
import { apiClient } from "../../../utils/apiClient";
import Modal from "../modal";
import Loading from "./loading";

interface PedidosParaSequenciamentoProps {
  allOrders: IPedido[];
  setOrders: Dispatch<SetStateAction<IPedido[]>>;
}

function PedidosParaSequenciamento({
  allOrders,
  setOrders,
}: PedidosParaSequenciamentoProps) {
  // const navigate = useNavigate();
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [pedidoFinalizado, setPedidoFinalizado] = useState<boolean>(false);
  const [processamentoEmAndamento, setProcessamentoEmAndamento] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>("");
  const [dataDoPedido, setDataDoPedido] = useState<string>(
    new Date().toISOString()
  );
  const [maquinasDisponiveis, setMaquinasDisponiveis] = useState<number>(100);
  const [todosPedidos, setTodosPedidos] = useState<IPedido[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] =
    useState<IPedido[]>([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { user_id } = useAuth();

  useEffect(() => {
    setTodosPedidos(allOrders);
    setPedidosFiltrados(allOrders);
  }, [allOrders]);
  

  useEffect(() => {
    setPedidosFiltrados(
      todosPedidos.filter((pedido) => pedido.name.includes(busca))
    );
  }, [busca]);

  const connectToSSE = () => {
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL;
      const sseUrl = `${baseURL}/sequenciamento/sequenciamento/stream?user_id=${user_id}`;
      
      const newEventSource = new EventSource(sseUrl);

      newEventSource.onopen = () => { 
        console.log('SSE connection established');
      };

      newEventSource.onmessage = (event) => {
        try {
          console.log('Evento recebido',event);
          // const data = JSON.parse(event.data);
          // const isFinished = data.finished || data.completed || data.status === 'finished';
          // console.log('dado',data)
          // if (isFinished) {
          //   setPedidoFinalizado(true);
          //   setProcessamentoEmAndamento(false);
            
          //   newEventSource.close();
          //   setEventSource(null);
            
          //   setTimeout(() => {
          //     navigate('/sequenciamento');
          //   }, 1000);
          // }
        } catch (error) {
          console.error('Erro ao processar mensagem SSE:', error);
        }
      };

      newEventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        newEventSource.close();
        setEventSource(null);
        setProcessamentoEmAndamento(false);
        setPedidoFinalizado(false);
      };

      setEventSource(newEventSource);
    } catch (error) {
      console.error('Erro ao conectar ao SSE:', error);
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

  const handleVoltarPedido = (pedido: IPedido) => {
    setOrders((prev) => {
      const newOrders = [...prev];
      const index = newOrders.findIndex(p => p.id === pedido.id);
      newOrders.splice(index, 1);
      return newOrders;
    });
  };

  const iniciarSequenciamentoFunc = async () => {
    try {
      setIsloading(true);

      if(!pedidoFinalizado) {
        toast.error('O processamento ainda não foi finalizado !')
        return;
      }

      if(maquinasDisponiveis > 100 || maquinasDisponiveis < 1) {
        toast.error('O número de máquinas disponíveis deve ser entre 0 e 100.')
        return;
      }

      await apiClient.post(
        `/sequenciamento/sequenciamento/solve?sequencing_date=${dataDoPedido}&machine_availability=${maquinasDisponiveis}`,
        todosPedidos.map((p) => p.id)
      );

      if(!eventSource){
        connectToSSE();
      }
      setPedidoFinalizado(false);
      setProcessamentoEmAndamento(true);
      setTodosPedidos([]);
      setPedidosFiltrados([]);
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
    <div className="w-full md:w-1/2 bg-white rounded-md shadow p-4">
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

      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[350px] md:h-[380px] overflow-x-auto">
        {allOrders.length === 0 ? (
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
              {pedidosFiltrados.map((pedido) => (
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
                    {pedido.promised_date}
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
        <div className="w-full  flex  items-center gap-10">
          <div className="w-full flex flex-col gap-2">
            <label htmlFor="maquinas-disponiveis">
              Disponibilidade de máquinas
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
          </div>
          <div className="w-full flex flex-col gap-2">
            <label htmlFor="data-pedido">Data do Pedido</label>
            <input
              id="data-pedido"
              type="date"
              value={dataDoPedido}
              onChange={(e) => setDataDoPedido(e.target.value)}
              className="w-full outline-none border-b border-[#A4AABC]"
            />
          </div>
        </div>
        <button
          disabled={isLoading || todosPedidos.length === 0 || !dataDoPedido || !maquinasDisponiveis || processamentoEmAndamento || !pedidoFinalizado}
          onClick={iniciarSequenciamentoFunc}
          className="w-1/2 md:w-full text-sm  cursor-pointer inline-flex items-center justify-center md:text-lg px-2 py-2 bg-green-600 disabled:bg-gray-400 disabled:cursor-default hover:bg-green-700 text-white font-medium rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {processamentoEmAndamento ? 'Processando...' : 'Iniciar'}
        </button>
      </div>
    </div>
  );
}

export default PedidosParaSequenciamento;
