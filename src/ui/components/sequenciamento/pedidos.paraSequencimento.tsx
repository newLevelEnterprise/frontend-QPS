import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { toast } from "react-toastify";
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
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>("");
  const [dataDoPedido, setDataDoPedido] = useState<string>(
    new Date().toISOString()
  );
  const [maquinasDisponiveis, setMaquinasDisponiveis] = useState<number>(0);
  const [todosPedidos] = useState<IPedido[]>(allOrders);
  const [pedidosFiltrados, setPedidosFiltrados] =
    useState<IPedido[]>(todosPedidos);

  useEffect(() => {
    setPedidosFiltrados(
      todosPedidos.filter((pedido) => pedido.name.includes(busca))
    );
  }, [busca]);

  const handleVoltarPedido = (pedido: IPedido) => {
    setOrders((prev) => [...prev, pedido]);
  };

  const iniciarSequenciamentoFunc = async () => {
    try {
      setIsloading(true);
      await apiClient.post(
        `/sequenciamento/sequenciamento/solve?sequencing_date=${dataDoPedido}&machine_availability=${maquinasDisponiveis}`,
        todosPedidos.map((p) => p.id)
      );
      toast.success("Sequenciamento iniciado com sucesso!");
    } catch (error) {
      console.log(error);
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

      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[350px] md:h-[380px]">
        {allOrders.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <h2 className="text-lg md:text-2xl text-gray-500 font-semibold">
              Nenhum pedido encontrado !
            </h2>
          </div>
        ) : (
          <table className="w-full">
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
                  Horário Prometido
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
                    {pedido.total_time_hours}
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
              Quantidade de máquinas disponíveis
            </label>
            <input
              id="maquinas-disponiveis"
              type="number"
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
          disabled={isLoading || todosPedidos.length === 0}
          onClick={iniciarSequenciamentoFunc}
          className="w-1/2 md:w-full text-sm  cursor-pointer inline-flex items-center justify-center md:text-lg px-2 py-2 bg-green-600 disabled:bg-gray-400 disabled:cursor-default hover:bg-green-700 text-white font-medium rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Iniciar
        </button>
      </div>
    </div>
  );
}

export default PedidosParaSequenciamento;
