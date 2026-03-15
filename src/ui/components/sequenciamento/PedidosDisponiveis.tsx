import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { TbTrash } from "react-icons/tb";
import { VscLoading } from "react-icons/vsc";
import { toast } from "react-toastify";
import type { IPedido } from "../../../types/Pedido";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";

function PedidosDisponiveis() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState<string>("");

  const { data: jobs, isFetching } = useQuery({
    queryKey: ["get", "jobs"],
    queryFn: async () => {
      const { data } = await apiClient.get<IPedido[]>("/jobs");
      const jsonItens = localStorage.getItem("jobs_para_sequenciamento");
      if (!jsonItens) {
        return data;
      }
      const jobsParaSequenciamento = JSON.parse(jsonItens) as IPedido[];
      const filteredData: IPedido[] = [];

      if (jobsParaSequenciamento.length > 0) {
        for (const p of data) {
          if (jobsParaSequenciamento.some((j) => j.id === p.id)) {
            continue;
          } else {
            filteredData.push(p);
          }
        }

        return filteredData;
      }

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
    queryClient.setQueryData(
      ["jobs", "para", "sequenciamento"],
      (actualData: IPedido[]) => {
        if (!actualData) {
          localStorage.setItem(
            "jobs_para_sequenciamento",
            JSON.stringify([pedido]),
          );
          return [pedido];
        }
        localStorage.setItem(
          "jobs_para_sequenciamento",
          JSON.stringify([...actualData, pedido]),
        );
        return [...actualData, pedido];
      },
    );
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

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      if (jobs) {
        for (const job of jobs) {
          console.log("deletado", job.id);
          await apiClient.delete(`/jobs/${job.id}`);
        }
      }
    },
  });
  const deletarTodosJobsFn = async () => {
    try {
      await mutateAsync();
      toast.success("Pedidos deletado com sucesso", {
        toastId: "deleteTodosPedidosToast",
      });
      queryClient.setQueryData(["get", "jobs"], () => {
        localStorage.removeItem("jobs_para_sequenciamento");
        return [];
      });
      queryClient.setQueryData(["jobs", "para", "sequenciamento"], () => {
        return [];
      });
    } catch (error) {
      console.log(error);
      toast.error("Erro ao deletar os pedidos", {
        toastId: "deleteTodosPedidosToast",
      });
    }
  };
  console.log("jobs disponiveis", jobs);
  return (
    <div className="w-full md:w-[65%]  bg-white rounded-md shadow p-4 overflow-x-auto">
      <h1 className="text-lg md:text-xl text-[#5B85D5] font-bold">
        Pedidos Disponíveis
      </h1>
      <div className="flex justify-between items-end gap-10">
        <div className="relative flex-1 mt-4">
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
          disabled={!jobs || jobs.length === 0}
          onClick={deletarTodosJobsFn}
          className="bg-red-700 disabled:bg-red-200 disabled:cursor-default text-xs px-4 py-3 md:text-sm md:px-6 md:py-3 rounded-xl text-white hover:bg-red-600 cursor-pointer transition-colors duration-200"
        >
          {isPending ? (
            <VscLoading size={20} className="animate-spin" />
          ) : (
            "Apagar tudo"
          )}
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[400px] md:h-[470px] overflow-x-scroll">
        {isFetching ? (
          <Loader message="Carregando pedidos" />
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
                <th className="sticky top-0 z-10 bg-gray-100 px-1 py-2 text-center text-xs text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Número do pedido
                </th>
                <th className="sticky top-0 z-10 bg-gray-100 px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Cliente
                </th>
                <th className="sticky top-0 z-10 bg-gray-100 px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Produto
                </th>
                <th className="sticky top-0 z-10 bg-gray-100 px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Demanda
                </th>
                <th className="sticky top-0 z-10 bg-gray-100 px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Data Prometida
                </th>
                <th className="sticky top-0 z-10 bg-gray-100 px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Hora Prometida
                </th>
                <th className="sticky top-0 z-10 bg-gray-100 px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Valor
                </th>
                <th className="sticky top-0 z-10 bg-gray-100 px-1 py-2 text-center text-xs text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Prioridade
                </th>
                <th className="sticky top-0 z-10 bg-gray-100 px-1 py-2 text-left text-xs text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto">
              {jobs
                .filter((pedido) => pedido.product_name.includes(busca))
                .map((pedido) => (
                  <tr
                    key={pedido.id}
                    onClick={() => handleAddPedido(pedido)}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-center text-black truncate text-ellipsis">
                      {pedido.order_number}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                      {pedido.client ? pedido.client.name : "-"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                      {pedido.product_name.split(" - ")[1]}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                      {Intl.NumberFormat("pt-br").format(pedido.demand)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                      {Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                      }).format(new Date(pedido.promised_date))}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                      {Intl.DateTimeFormat("pt-BR", {
                        timeStyle: "short",
                      }).format(new Date(pedido.promised_date))}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                      {Intl.NumberFormat("pt-br", {
                        style: "currency",
                        currency: "BRL",
                      }).format(pedido.product_value)}
                    </td>
                    <td className="px-2 py-2 text-center whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis">
                      {pedido.client ? pedido.client.priority : 0}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-xs md:text-sm text-black truncate text-ellipsis relative">
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
