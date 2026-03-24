import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { toast } from "react-toastify";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";
import FormEditarInsumo from "./formEditarMaquina";
import FormNovoInsumo from "./formNovoInsumo";

function Insumos() {
  const queryClient = useQueryClient();
  const [novoInsumo, setNovoInsumo] = useState<boolean>(false);
  const [editarInsumo, setEditarInsumo] = useState<boolean>(false);

  const [insumo, setInsumo] = useState<{
    nome: string;
    id: number;
    lead_time_medio_entrega: number;
    custo_medio: string;
  }>({
    id: 0,
    nome: "",
    lead_time_medio_entrega: 0,
    custo_medio: "",
  });

  const { data: insumos, isFetching } = useQuery({
    queryKey: ["get", "all", "insumos"],
    queryFn: async () => {
      const { data } = await apiClient.get<
        {
          nome: string;
          id: number;
          lead_time_medio_entrega: number;
          custo_medio: string;
        }[]
      >("/raw-material/");
      return data;
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/raw-material/${id}`);
    },
    onError: (error) => {
      console.error("Erro ao deletar insumo:", error);
      toast.error("Erro ao deletar insumo. Por favor, tente novamente.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get", "all", "insumos"],
      });
      toast.success("Insumo deletado com sucesso!");
    },
  });

  return (
    <div className="w-full bg-white rounded-md shadow p-4 overflow-auto">
      <Modal.Root isVisible={novoInsumo}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Novo Insumo"
            onClose={() => setNovoInsumo(false)}
          />
          <FormNovoInsumo
            setInsumo={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "insumos"],
              })
            }
            setNovoInsumo={setNovoInsumo}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={editarInsumo}>
        <Modal.Container>
          <Modal.Header
            title="Editar Insumo"
            onClose={() => setEditarInsumo(false)}
          />
          <FormEditarInsumo
            setInsumo={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "insumos"],
              })
            }
            setEditarInsumo={setEditarInsumo}
            insumo={insumo}
          />
        </Modal.Container>
      </Modal.Root>
      <h1 className="text-xl text-[#5B85D5] font-bold">
        Cadastrar Matéria-Prima
      </h1>
      {isFetching && <Loader message="Carregando insumos" />}
      {!isFetching && (
        <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-fit max-h-[470px] overflow-x-auto">
          <table className="w-full overflow-auto max-h-[470px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Material
                </th>
                <th className="px-6 py-4 text-xs md:text-sm font-medium text-gray-700 text-center">
                  Lead Time Médio de Entrega (dias)
                </th>
                <th className="px-6 py-4 text-xs md:text-sm font-medium text-gray-700 text-center">
                  Custo Médio (R$/Kg)
                </th>
                <th className="px-6 py-4 text-right text-xs md:text-sm font-medium text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {insumos?.map((insumo) => (
                <tr
                  key={insumo.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {insumo.nome}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900 text-center">
                    {insumo.lead_time_medio_entrega}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900 text-center">
                    {insumo.custo_medio}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="w-full flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditarInsumo(true);
                          setInsumo(insumo);
                        }}
                        className="text-blue-600 cursor-pointer hover:text-blue-800 text-xs md:text-sm font-medium transition-colors duration-150"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => mutateAsync(insumo.id)}
                        disabled={isFetching || isPending}
                        className="text-red-500 cursor-pointer hover:text-red-700 text-xs md:text-sm font-medium transition-colors duration-150"
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-col gap-4 items-center justify-center mt-4">
        <button
          disabled={isFetching}
          onClick={() => {
            setNovoInsumo(true);
            setInsumo({
              id: 0,
              nome: "",
              lead_time_medio_entrega: 0,
              custo_medio: "",
            });
          }}
          className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <CiCirclePlus className="w-4 h-4 md:h-6 md:w-6 mr-2" />
          Adicionar Nova Matéria Prima
        </button>
      </div>
    </div>
  );
}

export default Insumos;
