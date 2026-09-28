import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useMemo, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { hideMoldFields } from "../../../config/featureFlags";
import type { ILinhasProducao } from "../../../types/LinhaProducao";
import type { IMaquinasType } from "../../../types/Maquina";
import type { IMoldes } from "../../../types/Moldes";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import Loader from "../Loader";
import Modal from "../modal";
import XlsxUpload from "../XlsxUpload";

interface ProductionTimeRow {
  id: number;
  tempo_ciclo: number;
  machine_id: number;
  product_id: number;
  mold_id: number;
  machine: { id: number; name: string };
  product: { id: number; name: string };
  mold: { id: number; name: string };
}

interface MachineDraft {
  key: string;
  machineId: string;
  tempo: string;
}

type SetupAction = "upload" | "download";

function newMachineDraft(): MachineDraft {
  return {
    key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    machineId: "",
    tempo: "",
  };
}

function apiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
  }
  return fallback;
}

async function blobErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error) || !(error.response?.data instanceof Blob)) {
    return apiErrorMessage(error, fallback);
  }
  try {
    const text = await error.response.data.text();
    const parsed = JSON.parse(text) as { detail?: unknown };
    if (typeof parsed.detail === "string" && parsed.detail.trim()) {
      return parsed.detail;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

function TempoProducao() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cycleModal, setCycleModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ProductionTimeRow | null>(null);
  const [moldId, setMoldId] = useState("");
  const [productId, setProductId] = useState("");
  const [machineRows, setMachineRows] = useState<MachineDraft[]>([
    newMachineDraft(),
  ]);
  const [saving, setSaving] = useState(false);

  const [setupAction, setSetupAction] = useState<SetupAction | null>(null);
  const [selectedLineId, setSelectedLineId] = useState("");
  const [lineError, setLineError] = useState("");
  const [uploadLine, setUploadLine] = useState<ILinhasProducao | null>(null);
  const [downloading, setDownloading] = useState(false);

  const { data: tempos, isFetching } = useQuery({
    queryKey: ["productionTimes"],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductionTimeRow[]>("/production-time/");
      return data;
    },
  });

  const { data: linhas, isFetching: isFetchingLinhas } = useQuery({
    queryKey: ["productionLines"],
    queryFn: async () => {
      const { data } = await apiClient.get<ILinhasProducao[]>("/production-lines/");
      return data;
    },
  });

  const { data: moldes } = useQuery({
    queryKey: ["get", "all", "moldes"],
    queryFn: async () => {
      const { data } = await apiClient.get<IMoldes[]>("/molds/");
      return data;
    },
    enabled: cycleModal !== null,
  });

  const { data: maquinas } = useQuery({
    queryKey: ["get", "all", "maquinas"],
    queryFn: async () => {
      const { data } = await apiClient.get<IMaquinasType[]>("/machines/");
      return data;
    },
    enabled: cycleModal !== null,
  });

  const { mutateAsync: remover } = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/production-time/${id}`);
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, "Erro ao remover tempo de ciclo."));
    },
    onSuccess: () => {
      toast.success("Tempo de ciclo removido.");
      queryClient.invalidateQueries({ queryKey: ["productionTimes"] });
    },
  });

  const selectedMold = moldes?.find((mold) => String(mold.id) === moldId);
  const moldProducts = selectedMold?.products ?? [];

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = tempos ?? [];
    if (!term) return rows;
    return rows.filter((row) => {
      const moldName = hideMoldFields ? "" : row.mold.name;
      return [moldName, row.product.name, row.machine.name]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [search, tempos]);

  function abrirCriar() {
    setEditing(null);
    setMoldId("");
    setProductId("");
    setMachineRows([newMachineDraft()]);
    setCycleModal("create");
  }

  function abrirEditar(row: ProductionTimeRow) {
    setEditing(row);
    setMoldId(String(row.mold_id));
    setProductId(String(row.product_id));
    setMachineRows([
      {
        key: "edit",
        machineId: String(row.machine_id),
        tempo: String(row.tempo_ciclo),
      },
    ]);
    setCycleModal("edit");
  }

  function fecharCiclo() {
    setCycleModal(null);
    setEditing(null);
  }

  function aoMudarMolde(value: string) {
    setMoldId(value);
    const mold = moldes?.find((item) => String(item.id) === value);
    const products = mold?.products ?? [];
    setProductId(products.length === 1 ? String(products[0].id) : "");
  }

  async function salvarCiclo() {
    const product = Number(productId);
    const mold = Number(moldId);
    if (!mold || !product) {
      toast.error("Selecione o molde e o componente.");
      return;
    }

    const payloads = machineRows.map((row) => ({
      machine_id: Number(row.machineId),
      product_id: product,
      mold_id: mold,
      tempo_ciclo: Number(row.tempo),
    }));

    if (
      payloads.some(
        (item) =>
          !item.machine_id ||
          !Number.isFinite(item.tempo_ciclo) ||
          item.tempo_ciclo <= 0,
      )
    ) {
      toast.error("Informe a máquina e um tempo de ciclo maior que zero.");
      return;
    }

    const machineIds = payloads.map((item) => item.machine_id);
    if (new Set(machineIds).size !== machineIds.length) {
      toast.error("Não repita a mesma máquina no mesmo tempo de ciclo.");
      return;
    }

    setSaving(true);
    try {
      if (cycleModal === "edit" && editing) {
        await apiClient.put(`/production-time/${editing.id}`, payloads[0]);
        toast.success("Tempo de ciclo atualizado.");
      } else {
        for (const payload of payloads) {
          await apiClient.post("/production-time", payload);
        }
        toast.success("Tempo de ciclo salvo.");
      }
      await queryClient.invalidateQueries({ queryKey: ["productionTimes"] });
      fecharCiclo();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Erro ao salvar tempo de ciclo."));
    } finally {
      setSaving(false);
    }
  }

  function abrirSeletorLinha(action: SetupAction) {
    setSetupAction(action);
    setSelectedLineId("");
    setLineError("");
  }

  function fecharSeletorLinha() {
    setSetupAction(null);
    setSelectedLineId("");
    setLineError("");
  }

  async function baixarPlanilha(linha: ILinhasProducao) {
    setDownloading(true);
    try {
      const response = await apiClient.get(
        `/template/setup-matrix/${linha.id}`,
        { responseType: "blob" },
      );
      const header = String(response.headers["content-disposition"] ?? "");
      const fromHeader = header.match(/filename="?([^"]+)"?/)?.[1];
      const filename =
        fromHeader ||
        `setup_matrix_linha_${linha.name.replace(/\s+/g, "_")}.xlsx`;
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        await blobErrorMessage(error, "Erro ao baixar a planilha de setup."),
      );
    } finally {
      setDownloading(false);
    }
  }

  async function continuarLinha() {
    const linhasCadastradas = linhas ?? [];
    if (linhasCadastradas.length === 0) return;

    const linha = linhasCadastradas.find(
      (item) => String(item.id) === selectedLineId,
    );
    if (!linha) {
      setLineError("Selecione uma linha de produção para continuar.");
      return;
    }

    const action = setupAction;
    fecharSeletorLinha();

    if (action === "upload") {
      setUploadLine(linha);
      return;
    }

    await baixarPlanilha(linha);
  }

  const semLinhas = !isFetchingLinhas && (linhas?.length ?? 0) === 0;
  const totalLabel =
    filtrados.length === 1
      ? "1 configuração cadastrada"
      : `${filtrados.length} configurações cadastradas`;

  return (
    <div className="w-full h-full min-h-0 overflow-y-auto bg-white rounded-md shadow p-4">
      <Modal.Root isVisible={cycleModal !== null}>
        <Modal.Container className="w-[min(560px,95vw)]">
          <Modal.Header
            title={
              cycleModal === "edit"
                ? "Editar Tempo de Ciclo"
                : "Adicionar Tempo de Ciclo"
            }
            onClose={fecharCiclo}
          />
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#212A4F]">
              Molde
              <select
                className="h-10 rounded-md border border-gray-300 px-3 font-normal outline-none"
                value={moldId}
                onChange={(event) => aoMudarMolde(event.target.value)}
              >
                <option value="">
                  {hideMoldFields ? "Selecione" : "Selecione um molde"}
                </option>
                {moldes?.map((mold) => (
                  <option key={mold.id} value={mold.id}>
                    {hideMoldFields
                      ? mold.products.map((product) => product.name).join(", ") ||
                        mold.name
                      : mold.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#212A4F]">
              Componente
              <select
                className="h-10 rounded-md border border-gray-300 px-3 font-normal outline-none"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                disabled={!moldId}
              >
                <option value="">
                  {moldId ? "Selecione um componente" : "Selecione um molde"}
                </option>
                {moldProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center justify-between">
              <strong className="text-sm text-[#212A4F]">
                Máquinas e tempos de ciclo
              </strong>
              {cycleModal === "create" && (
                <button
                  type="button"
                  className="cursor-pointer text-sm font-medium text-[#255DC8]"
                  onClick={() =>
                    setMachineRows((rows) => [...rows, newMachineDraft()])
                  }
                >
                  + Adicionar máquina
                </button>
              )}
            </div>
            {machineRows.map((row) => (
              <div
                key={row.key}
                className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_160px_auto]"
              >
                <label className="flex flex-col gap-2 text-xs font-semibold text-[#212A4F]">
                  Máquina
                  <select
                    className="h-10 rounded-md border border-gray-300 px-3 font-normal outline-none"
                    value={row.machineId}
                    onChange={(event) =>
                      setMachineRows((rows) =>
                        rows.map((item) =>
                          item.key === row.key
                            ? { ...item, machineId: event.target.value }
                            : item,
                        ),
                      )
                    }
                  >
                    <option value="">Selecione uma máquina</option>
                    {maquinas?.map((machine) => (
                      <option key={machine.id} value={machine.id}>
                        {machine.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-xs font-semibold text-[#212A4F]">
                  Tempo de ciclo (s)
                  <input
                    type="number"
                    min={1}
                    placeholder="0"
                    className="h-10 rounded-md border border-gray-300 px-3 font-normal outline-none"
                    value={row.tempo}
                    onChange={(event) =>
                      setMachineRows((rows) =>
                        rows.map((item) =>
                          item.key === row.key
                            ? { ...item, tempo: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                {cycleModal === "create" && (
                  <button
                    type="button"
                    className="h-10 cursor-pointer text-sm text-gray-500 disabled:cursor-not-allowed disabled:text-gray-300"
                    disabled={machineRows.length === 1}
                    onClick={() =>
                      setMachineRows((rows) =>
                        rows.filter((item) => item.key !== row.key),
                      )
                    }
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-[#344054]"
              onClick={fecharCiclo}
            >
              Cancelar
            </button>
            <Button
              title="Salvar"
              isLoading={saving}
              disable={saving}
              onClick={() => {
                void salvarCiclo();
              }}
            />
          </div>
        </Modal.Container>
      </Modal.Root>

      <Modal.Root isVisible={setupAction !== null}>
        <Modal.Container className="w-[min(560px,95vw)]">
          <Modal.Header
            title={
              setupAction === "upload"
                ? "Selecionar Linha para Upload"
                : "Selecionar Linha para Download"
            }
            onClose={fecharSeletorLinha}
          />
          <div className="mt-4">
            {semLinhas ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-[#344054]">
                  Nenhuma linha de produção cadastrada.
                </p>
                <Link
                  to="/cadastro/linhas-producao"
                  className="w-fit text-sm font-semibold text-[#255DC8]"
                  onClick={fecharSeletorLinha}
                >
                  Cadastrar Linha de Produção
                </Link>
              </div>
            ) : (
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#212A4F]">
                Linha de Produção
                <select
                  className="h-10 rounded-md border border-gray-300 px-3 font-normal outline-none"
                  value={selectedLineId}
                  onChange={(event) => {
                    setSelectedLineId(event.target.value);
                    setLineError("");
                  }}
                  disabled={isFetchingLinhas}
                >
                  <option value="">
                    {isFetchingLinhas
                      ? "Carregando linhas..."
                      : "Selecione uma linha"}
                  </option>
                  {linhas?.map((linha) => (
                    <option key={linha.id} value={linha.id}>
                      {linha.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {lineError && (
              <p className="mt-2 text-xs text-[#c2410c]">{lineError}</p>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-[#344054]"
              onClick={fecharSeletorLinha}
            >
              Cancelar
            </button>
            <Button
              title="Continuar"
              isLoading={downloading}
              disable={semLinhas || downloading || isFetchingLinhas}
              onClick={() => {
                void continuarLinha();
              }}
            />
          </div>
        </Modal.Container>
      </Modal.Root>

      <Modal.Root isVisible={uploadLine !== null}>
        <Modal.Container className="w-[min(720px,95vw)]">
          <Modal.Header
            title="Upload da Planilha de Setup"
            onClose={() => setUploadLine(null)}
          />
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#212A4F]">
              Linha de Produção
              <input
                readOnly
                value={uploadLine?.name ?? ""}
                className="h-10 rounded-md border border-gray-300 bg-gray-50 px-3 font-normal outline-none"
              />
            </label>
            {uploadLine && (
              <XlsxUpload
                endpoint={`setup-matrix-xlsx/${uploadLine.id}`}
                onClose={() => setUploadLine(null)}
                mainDivClassName="shadow-none h-auto bg-transparent p-0"
                uploaderContainerClassName="h-[96px]"
              />
            )}
          </div>
        </Modal.Container>
      </Modal.Root>

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#5B85D5]">Tempo de Produção</h1>
          <p className="mt-1 text-xs text-gray-500">
            Cadastro dos tempos de ciclo utilizados pelas linhas de produção.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => abrirSeletorLinha("upload")}
            className="cursor-pointer rounded-md bg-blue-300 px-4 py-1 text-white transition-colors duration-150 hover:bg-blue-400"
          >
            Upload da Planilha de Setup
          </button>
          <button
            type="button"
            onClick={() => abrirSeletorLinha("download")}
            className="cursor-pointer rounded-md border border-[#255DC8] bg-white px-4 py-1 text-[#255DC8] transition-colors duration-150 hover:bg-blue-50"
          >
            Download da Planilha de Setup
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar molde, componente ou máquina..."
          className="h-10 w-full max-w-[390px] rounded-full border border-gray-300 px-4 text-sm outline-none"
        />
        <span className="text-xs text-gray-500">{totalLabel}</span>
      </div>

      {isFetching && <Loader message="Carregando tempos de produção" />}
      {!isFetching && (
        <div className="mt-2 h-fit max-h-[470px] overflow-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-gray-200">
                {!hideMoldFields && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 md:text-sm">
                    Molde
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 md:text-sm">
                  Componente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 md:text-sm">
                  Máquina
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 md:text-sm">
                  Tempo de ciclo (s)
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 md:text-sm">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  {!hideMoldFields && (
                    <td className="px-6 py-4 text-xs text-gray-900 md:text-sm">
                      {row.mold.name}
                    </td>
                  )}
                  <td className="px-6 py-4 text-xs text-gray-900 md:text-sm">
                    {row.product.name}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-900 md:text-sm">
                    {row.machine.name}
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-gray-900 md:text-sm">
                    {row.tempo_ciclo}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEditar(row)}
                        className="cursor-pointer text-xs font-medium text-blue-600 transition-colors duration-150 hover:text-blue-800 md:text-sm"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void remover(row.id);
                        }}
                        className="cursor-pointer text-xs font-medium text-red-500 transition-colors duration-150 hover:text-red-700 md:text-sm"
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
      )}

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          disabled={isFetching}
          onClick={abrirCriar}
          className="inline-flex cursor-pointer items-center rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300 md:text-base"
        >
          <CiCirclePlus className="mr-2 h-4 w-4 md:h-6 md:w-6" />
          Adicionar Tempo de Ciclo
        </button>
      </div>
    </div>
  );
}

export default TempoProducao;
