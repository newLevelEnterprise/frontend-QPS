import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { hideMoldFields } from "../../../config/featureFlags";
import type { ICompositionLine, IMaquinas } from "../../../types/Maquina";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";
import XlsxUpload from "../XlsxUpload";
import FormEditarMaquina from "./formEditarMaquina";
import FormNovaMaquina from "./formNovaMaquina";
import FormSetup from "./formSetup";

export interface ResponseOfProductsSetups {
  id: number;
  name: string;
  setup_time: number;
  from_composition_line: {
    id: number;
    mold_name: string;
    product_name: string;
    name: string;
  };
  to_composition_line: {
    id: number;
    mold_name: string;
    product_name: string;
    name: string;
  };
}

type IEditMaquinaState = IMaquinas & {
  linhaId?: string | number;
  mold_id?: number;
  product_id?: number;
  product_name?: string;
  post_injection_cycle_time?: number | string;
  machines?: ICompositionLine["machines"];
};

function Maquina() {
  const { linhaId } = useParams();
  const queryClient = useQueryClient();
  const [novaMaquina, setNovaMaquina] = useState<boolean>(false);
  const [editarMaquina, setEditarMaquina] = useState<boolean>(false);
  const [setup, setSetup] = useState<{ nome: string; id: number } | null>(null);
  const [setupUploadModal, setSetupUploadModal] = useState<boolean>(false);

  const { data: linhaProd, isFetching } = useQuery({
    queryKey: ["get", "all", "linhaprod", linhaId],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        name: string;
        id: number;
        composition_lines: ICompositionLine[];
      }>(`/production-lines/${linhaId}`);
      return data;
    },
  });

  const { data: setupMatrix, isFetching: isFetchingSetupMatrix } = useQuery({
    queryKey: ["get", "all", "setupMatrix", linhaId],
    queryFn: async () => {
      const { data } = await apiClient.get<ResponseOfProductsSetups[]>(
        `/setup-matrix/production-line/${linhaId}`,
      );
      return data;
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/composition-lines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get", "all", "linhaprod", linhaId],
      });
      queryClient.invalidateQueries({
        queryKey: ["get", "all", "setupMatrix", linhaId],
      });
    },
    onError: () => {
      toast.error("Erro ao deletar a máquina. Tente novamente mais tarde.");
    },
  });

  const [maquina, setMaquina] = useState<IEditMaquinaState>({
    id: 0,
    name: "",
    disponibilidade: 0,
    codMolde: "",
    produto: "",
  });

  const machineColumns = Array.from(
    new Map(
      (linhaProd?.composition_lines ?? [])
        .flatMap((compositionLine) => compositionLine.machines ?? [])
        .map((machine) => [machine.id, machine]),
    ).values(),
  );

  return (
    <div className="w-full bg-white rounded-md shadow p-4 overflow-auto">
      <Modal.Root
        isVisible={
          novaMaquina && (linhaProd?.composition_lines.length ?? 0) < 10
        }
      >
        <Modal.Container>
          <Modal.Header
            title="Adicionar Nova Linha"
            onClose={() => setNovaMaquina(false)}
          />
          <FormNovaMaquina
            linhaId={linhaId}
            setMaquina={() => {
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "linhaprod", linhaId],
              });
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "setupMatrix", linhaId],
              });
            }}
            setNovaMaquina={setNovaMaquina}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={editarMaquina}>
        <Modal.Container>
          <Modal.Header
            title="Editar Linha"
            onClose={() => setEditarMaquina(false)}
          />
          <FormEditarMaquina
            setMaquina={() => {
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "linhaprod", linhaId],
              });
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "setupMatrix", linhaId],
              });
            }}
            setEditarMaquina={setEditarMaquina}
            maquina={maquina}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={!!setup} full>
        <Modal.Container>
          <Modal.Header
            title={setup?.nome || ""}
            onClose={() => setSetup(null)}
          />
          <FormSetup
            onClose={setSetup}
            linhaId={linhaId}
            setups={
              setupMatrix?.filter(
                (item) => item.from_composition_line.id === setup?.id,
              ) || []
            }
            isLoadingProducts={isFetchingSetupMatrix}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={setupUploadModal}>
        <Modal.Container>
          <Modal.Header
            title="Upload setup"
            onClose={() => setSetupUploadModal(false)}
          />
          <XlsxUpload
            endpoint={`setup-matrix-xlsx/${String(linhaId ?? "")}`}
            onRevalidate={() => {
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "linhaprod", linhaId],
              });
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "setupMatrix", linhaId],
              });
            }}
            onClose={() => setSetupUploadModal(false)}
            mainDivClassName="shadow-none h-auto bg-transparent p-0"
            uploaderContainerClassName="h-[96px]"
          />
        </Modal.Container>
      </Modal.Root>
      {(isFetching || isFetchingSetupMatrix) && (
        <Loader message="Carregando a sua linha de Produção ..." />
      )}
      {!isFetching && !linhaProd && (
        <div>
          <h1>Linha de Produção não encontrada</h1>
        </div>
      )}
      {!isFetching && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-xl text-[#5B85D5] font-bold">
              {linhaProd?.name}
            </h1>
            <div className="space-x-4">
              <button
                onClick={() => setSetupUploadModal(true)}
                className="px-4 py-1 bg-blue-300 hover:bg-blue-400 transition-colors duration-150 cursor-pointer text-white rounded-md"
              >
                Upload setup
              </button>
              <a
                target="_top"
                href={`https://api-quant-production.up.railway.app/template/setup-matrix/${linhaId}`}
                download
              >
                <button className="px-4 py-1 bg-blue-300 hover:bg-blue-400 transition-colors duration-150 cursor-pointer text-white rounded-md">
                  Download setup
                </button>
              </a>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-fit max-h-[470px] overflow-x-auto">
            <table className="w-full overflow-auto max-h-[470px]">
              <thead>
                <tr className="border-b border-gray-200">
                  {!hideMoldFields && (
                    <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                      Nome do Molde
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                    Produto
                  </th>
                  {!hideMoldFields && (
                    <>
                      <th className="px-6 py-4 text-center text-xs md:text-sm font-medium text-gray-700">
                        Total de Cavidades
                      </th>
                      <th className="px-6 py-4 text-center text-xs md:text-sm font-medium text-gray-700">
                        Cavidades Abertas
                      </th>
                    </>
                  )}
                  <th className="px-6 py-4 text-center text-xs md:text-sm font-medium text-gray-700">
                    Tempo pós-injeção (s)
                  </th>
                  {machineColumns.map((machine) => (
                    <th
                      key={machine.id}
                      className="px-6 py-4 text-center text-xs md:text-sm font-medium text-gray-700"
                    >
                      Tempo ciclo {machine.name} (s)
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center text-xs md:text-sm font-medium text-gray-700">
                    % Refugo
                  </th>
                  {!hideMoldFields && (
                    <th className="px-6 py-4 text-center text-xs md:text-sm font-medium text-gray-700">
                      % Absorver riscos de cav. fechadas
                    </th>
                  )}
                  <th className="px-6 py-4 text-right text-xs md:text-sm font-medium text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {linhaProd?.composition_lines.map((cp) => (
                  <tr
                    key={cp.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    {!hideMoldFields && (
                      <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                        {cp.mold_name}
                      </td>
                    )}
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                      {cp.product_name}
                    </td>
                    {!hideMoldFields && (
                      <>
                        <td className="px-6 py-4 text-xs md:text-sm text-gray-900 text-center">
                          {cp.mold.total_cavities}
                        </td>
                        <td className="px-6 py-4 text-xs md:text-sm text-gray-900 text-center">
                          {cp.mold.open_cavities}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900 text-center">
                      {cp.post_injection_cycle_time || "-"}
                    </td>
                    {machineColumns.map((machine) => {
                      const machineInCompositionLine = cp.machines.find(
                        (item) => item.id === machine.id,
                      );

                      return (
                        <td
                          key={`${cp.id}-${machine.id}`}
                          className="px-6 py-4 text-xs md:text-sm text-gray-900 text-center"
                        >
                          {machineInCompositionLine
                            ? machineInCompositionLine.cycle_time
                            : "-"}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-xs md:text-sm text-gray-900 text-center">
                      {cp.mold.scrap}
                    </td>
                    {!hideMoldFields && (
                      <td className="px-6 py-4 text-xs md:text-sm text-gray-900 text-center">
                        {cp.mold.closed_cavity_risk}
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="w-full flex justify-end gap-2">
                        <button
                          disabled={isPending}
                          onClick={() => {
                            setEditarMaquina(true);
                            setMaquina({
                              id: cp.id,
                              name: cp.product_name,
                              disponibilidade:
                                cp.machines?.[0]?.availability ?? 0,
                              codMolde: String(cp.mold_id),
                              produto:
                                cp.product_id != null
                                  ? String(cp.product_id)
                                  : cp.product_name,
                              linhaId,
                              mold_id: cp.mold_id,
                              product_id: cp.product_id,
                              product_name: cp.product_name,
                              post_injection_cycle_time:
                                cp.post_injection_cycle_time,
                              machines: cp.machines,
                            });
                          }}
                          className="text-blue-600 cursor-pointer hover:text-blue-800 text-xs md:text-sm font-medium transition-colors duration-150"
                        >
                          Editar
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() =>
                            setSetup({ nome: cp.product_name, id: cp.id })
                          }
                          className="text-blue-500 cursor-pointer hover:text-blue-700 text-xs md:text-sm font-medium transition-colors duration-150"
                        >
                          Setup
                        </button>
                        <button
                          onClick={() => mutateAsync(cp.id)}
                          disabled={isPending}
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
          </div>
          <div className="flex flex-col gap-4 items-center justify-center mt-4">
            <button
              disabled={isPending}
              onClick={() => {
                setNovaMaquina(true);
                setMaquina({
                  id: 0,
                  name: "",
                  disponibilidade: 0,
                  codMolde: "",
                  produto: "",
                });
              }}
              className="cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <CiCirclePlus className="w-4 h-4 md:h-6 md:w-6 mr-2" />
              Adicionar Info. da Linha
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Maquina;
