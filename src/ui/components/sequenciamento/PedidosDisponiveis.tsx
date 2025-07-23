import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { TbTrash } from "react-icons/tb";
import { toast } from "react-toastify";
import type { IPedido } from "../../../types/Pedido";
import { apiClient } from "../../../utils/apiClient";


function PedidosDisponiveis() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState<string>("");

  const { data: jobs, isFetching } = useQuery({
    queryKey: ["get", "jobs"],
    queryFn: async () => {
      const { data } = await apiClient.get<IPedido[]>("/jobs");
      return data;
    },
  });

  const handleAddPedido = (pedido: IPedido) => {
    queryClient.setQueryData(["get", "jobs"], (oldData: IPedido[]) => {
      if (!oldData) return oldData;
      const orders = [...oldData];
      const jobIndex = orders.findIndex((p) => p.id === pedido.id);
      orders.splice(jobIndex, 1);
      return orders;
    });
    queryClient.setQueryData(["jobs", "para", "sequenciamento"], (actualData: IPedido[]) => {
      console.log(actualData);
      if (!actualData) return [pedido];
      return [...actualData, pedido];
    });
  };

  const deletarJobFn = async (id: number) => {
    try {
      await apiClient.delete(`/jobs/${id}`);
      toast.success("Pedido deletado com sucesso", {
        toastId: "deletePedidoToast",
      });
      queryClient.setQueryData(["get", "jobs"], (oldData: IPedido[]) => {
        if (!oldData) return oldData;
        return oldData.filter((client) => client.id !== id);
      });
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar pedido", {
        toastId: "deletePedidoToast",
      });
    }
  };

  return (
    <div className="w-full md:w-[65%]  bg-white rounded-md shadow p-4 overflow-x-auto">
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

      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[400px] md:h-[470px] overflow-x-scroll">
        {isFetching ? (
          <div className="w-full h-full flex justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">
                Carregando produtos...
              </p>
            </div>
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <h2 className="text-lg md:text-2xl text-gray-500 font-semibold">
              Nenhum pedido encontrado !
            </h2>
          </div>
        ) : (
          <table className="w-full overflow-x-auto">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider">
                  Demanda
                </th>
                <th className="px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider">
                  Data Prometida
                </th>
                <th className="px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto">
              {jobs
                .filter((pedido) => pedido.name.includes(busca))
                .map((pedido) => (
                  <tr
                    key={pedido.id}
                    onClick={() => handleAddPedido(pedido)}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                      {pedido.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                      {pedido.product_value}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                      {Intl.NumberFormat("pt-br").format(pedido.demand)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                      {Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                      }).format(new Date(pedido.promised_date))}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                      {pedido.product_value}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis relative">
                      <div className="w-full flex justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletarJobFn(pedido.id);
                          }}
                          className="text-red-500 cursor-pointer hover:text-red-700 text-xs md:text-sm font-medium transition-colors duration-150"
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

export default PedidosDisponiveis;
