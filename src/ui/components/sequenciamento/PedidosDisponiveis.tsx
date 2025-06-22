import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import type { IPedido } from "../../../types/Pedido";
import { apiClient } from "../../../utils/apiClient";

interface PedidosDisponiveisProps {
  setPedidosSequenciamento: Dispatch<SetStateAction<IPedido[]>>;
}

function PedidosDisponiveis({
  setPedidosSequenciamento,
}: PedidosDisponiveisProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>("");
  const [todosPedidos, setTodosPedidos] = useState<IPedido[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] =
    useState<IPedido[]>([]);

  const handleAddPedido = (pedido: IPedido) => {
    setPedidosSequenciamento((prev) => [...prev, pedido]);
  };

  useEffect(() => {
    const getjobs = async () => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.get<IPedido[]>("/jobs");
        setPedidosFiltrados(data ?? []);
        setTodosPedidos(data ?? []);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        setPedidosFiltrados([]);
        setTodosPedidos([]);
      } finally {
        setIsLoading(false);
      }
    };

    getjobs();
  }, []);

  useEffect(() => {
    setPedidosFiltrados(
      todosPedidos.filter((pedido) => pedido.name.includes(busca))
    );
  }, [busca]);
  
  return (
    <div className="w-full md:w-1/2 bg-white rounded-md shadow p-4">
      <h1 className="text-lg md:text-xl text-[#5B85D5] font-bold">
        Pedidos Disponíveis
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

      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[400px] md:h-[470px]">
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">
                Carregando produtos...
              </p>
            </div>
          </div>
        ) : todosPedidos.length === 0 ? (
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
                  onClick={() => handleAddPedido(pedido)}
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
    </div>
  );
}

export default PedidosDisponiveis;
