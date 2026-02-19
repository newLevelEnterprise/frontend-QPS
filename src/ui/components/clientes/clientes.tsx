import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { IoSearchSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import type { ICliente } from "../../../types/Cliente";
import { apiClient } from "../../../utils/apiClient";
import Modal from "../modal";
import FormEditarCliente from "./formEditarCliente";
import FormNovoCliente from "./formNovoCliente";

function Clientes() {
  const queryClient = useQueryClient();
  const [novoCliente, setNovoCliente] = useState<boolean>(false);
  const [editarCliente, setEditarCliente] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>("");

  const [cliente, setCliente] = useState<ICliente>({
    id: 0,
    name: "",
    priority: 0,
  });

  const deletarClienteFn = async (clientId: number) => {
    try {
      await apiClient.delete(`/clients/${clientId}`);
      queryClient.setQueryData(
        ["get", "all", "clients"],
        (oldData: ICliente[]) => {
          if (!oldData) return oldData;
          return oldData.filter((client) => client.id !== clientId);
        },
      );
      toast.success("Cliente removido com sucesso!", {
        toastId: "deleteClientToast",
      });
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
      toast.error("Erro ao remover cliente. Tente novamente.");
    }
  };

  const { data: clientes, isFetching } = useQuery({
    queryKey: ["get", "all", "clients"],
    queryFn: async () => {
      const { data } = await apiClient.get<ICliente[]>("/clients/");
      return data;
    },
  });

  return (
    <div className="w-full bg-white rounded-md shadow p-4">
      <Modal.Root isVisible={novoCliente}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Novo Cliente"
            onClose={() => setNovoCliente(false)}
          />
          <FormNovoCliente
            setCliente={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "clients"],
              })
            }
            setNovoCliente={setNovoCliente}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={editarCliente}>
        <Modal.Container>
          <Modal.Header
            title="Editar Cliente"
            onClose={() => setEditarCliente(false)}
          />
          <FormEditarCliente
            setCliente={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "clients"],
              })
            }
            setEditarCliente={setEditarCliente}
            cliente={cliente}
          />
        </Modal.Container>
      </Modal.Root>
      <h1 className="text-xl text-[#5B85D5] font-bold">Clientes Cadastrados</h1>
      <div className="relative max-w-md mt-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IoSearchSharp className="h-4 w-4 text-gray-400" />
        </div>
        <input
          disabled={!clientes || clientes.length === 0}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          type="text"
          placeholder="Buscar..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-[470px] overflow-x-auto">
        {isFetching ? (
          <div className="w-full h-full flex justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">
                Carregando clientes...
              </p>
            </div>
          </div>
        ) : !clientes || clientes.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <h2 className="text-lg md:text-2xl text-gray-500 font-semibold">
              Nenhum cliente encontrado !
            </h2>
          </div>
        ) : (
          <table className="w-full overflow-x-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Prioridade
                </th>
                <th className="px-6 py-4 text-right text-xs md:text-sm font-medium text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes
                .filter((c) =>
                  c.name.toLowerCase().includes(busca.toLowerCase()),
                )
                .map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                      {cliente.name}
                    </td>
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                      {cliente.priority}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="w-full flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditarCliente(true);
                            setCliente(cliente);
                          }}
                          className="text-blue-600 cursor-pointer hover:text-blue-800 text-xs md:text-sm font-medium transition-colors duration-150"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deletarClienteFn(cliente.id)}
                          className="text-red-500 cursor-pointer hover:text-red-700 text-xs md:text-sm font-medium transition-colors duration-150"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-center mt-4 ">
        <button
          onClick={() => {
            setNovoCliente(true);
            setCliente({
              id: 0,
              name: "",
              priority: 0,
            });
          }}
          className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <CiCirclePlus className="w-4 h-4 md:h-6 md:w-6 mr-2" />
          Adicionar Novo Cliente
        </button>
      </div>
    </div>
  );
}

export default Clientes;
