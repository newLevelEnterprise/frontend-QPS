import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { hideMoldFields } from "../../../config/featureFlags";
import type { IMoldes } from "../../../types/Moldes";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import type { IComponenteSemMolde } from "./componentesSemMolde";

export type VinculoModo = "existing" | "new";

interface FormVincularComponenteProps {
  component: IComponenteSemMolde;
  initialMode: VinculoModo;
  onClose: () => void;
  onSaved: () => void;
}

function externalIdLabel(externalId?: string | null) {
  const value = (externalId ?? "").trim();
  return value || "—";
}

function apiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const detail = (error as { response?: { data?: { detail?: unknown } } })
      .response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
  }
  return fallback;
}

function parsePercent(value: string, label: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(`${label} deve ficar entre 0 e 100.`);
  }
  return parsed;
}

function parseCavity(value: string, label: string, min: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min) {
    throw new Error(
      min === 1
        ? `${label} deve ser um número inteiro maior que zero.`
        : `${label} deve ser um número inteiro maior ou igual a zero.`,
    );
  }
  return parsed;
}

function FormVincularComponente({
  component,
  initialMode,
  onClose,
  onSaved,
}: FormVincularComponenteProps) {
  const [mode, setMode] = useState<VinculoModo>(initialMode);
  const [moldId, setMoldId] = useState("");
  const [name, setName] = useState("");
  const [totalCavities, setTotalCavities] = useState(
    hideMoldFields ? "1" : "1",
  );
  const [openCavities, setOpenCavities] = useState(hideMoldFields ? "1" : "1");
  const [scrap, setScrap] = useState("0");
  const [closedCavityRisk, setClosedCavityRisk] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const { data: moldes, isFetching } = useQuery({
    queryKey: ["get", "all", "moldes"],
    queryFn: async () => {
      const { data } = await apiClient.get<IMoldes[]>("/molds/");
      return data;
    },
  });

  const displayedId = externalIdLabel(component.external_id);

  const linkToExistingMold = async () => {
    const selected = (moldes ?? []).find((mold) => String(mold.id) === moldId);
    if (!selected) {
      throw new Error("Selecione um molde.");
    }
    const productIds = [
      ...new Set([
        ...selected.products.map((product) => product.id),
        component.id,
      ]),
    ];
    await apiClient.put(`/molds/${selected.id}`, {
      name: selected.name,
      products: productIds,
      total_cavities: Number(selected.total_cavities),
      open_cavities: Number(selected.open_cavities),
      scrap: Number(selected.scrap),
      closed_cavity_risk: Number(selected.closed_cavity_risk),
    });
    toast.success("Componente vinculado ao molde.");
  };

  const createMoldForComponent = async () => {
    const moldName = name.trim();
    if (!moldName) {
      throw new Error("Informe o nome do molde.");
    }
    const total = hideMoldFields
      ? 1
      : parseCavity(totalCavities, "Total de cavidades", 1);
    const open = hideMoldFields
      ? 1
      : parseCavity(openCavities, "Cavidades abertas", 0);
    if (open > total) {
      throw new Error("Cavidades abertas não podem ser maiores que o total.");
    }
    await apiClient.post("/molds", {
      name: moldName,
      products: [component.id],
      total_cavities: total,
      open_cavities: open,
      scrap: parsePercent(scrap, "% Refugo"),
      closed_cavity_risk: hideMoldFields
        ? 0
        : parsePercent(closedCavityRisk, "% Risco de cavidade"),
    });
    toast.success("Molde criado e componente vinculado.");
  };

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      if (mode === "existing") {
        await linkToExistingMold();
      } else {
        await createMoldForComponent();
      }
      onSaved();
    } catch (error) {
      if (error instanceof Error && !("response" in error)) {
        toast.error(error.message);
        return;
      }
      toast.error(
        apiErrorMessage(
          error,
          mode === "existing"
            ? "Erro ao vincular o componente. Tente novamente."
            : "Erro ao criar o molde. Tente novamente.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="my-4 flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-semibold text-[#212A4F]">
        Componente
        <input
          readOnly
          value={component.name}
          className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-normal text-gray-900 outline-none"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-[#212A4F]">
        ID
        <input
          readOnly
          value={displayedId}
          className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-normal text-gray-900 outline-none"
        />
        <span className="text-xs font-normal text-gray-500">
          ID externo já cadastrado no componente.
        </span>
      </label>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`cursor-pointer rounded-lg border p-3 text-left ${
            mode === "existing"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <span className="block text-sm font-bold text-gray-900">
            Adicionar a um molde
          </span>
          <span className="mt-1 block text-xs font-normal text-gray-500">
            Vincula o componente a um molde já cadastrado.
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`cursor-pointer rounded-lg border p-3 text-left ${
            mode === "new"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <span className="block text-sm font-bold text-gray-900">
            Criar novo molde
          </span>
          <span className="mt-1 block text-xs font-normal text-gray-500">
            Cria um novo molde e já vincula este componente.
          </span>
        </button>
      </div>

      {mode === "existing" ? (
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#212A4F]">
          Molde
          <select
            value={moldId}
            onChange={(event) => setMoldId(event.target.value)}
            disabled={isFetching}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal text-gray-900 outline-none"
          >
            <option value="">
              {isFetching ? "Carregando moldes..." : "Selecione um molde"}
            </option>
            {(moldes ?? []).map((mold) => {
              const components = mold.products.map((product) => product.name).join(", ");
              return (
                <option key={mold.id} value={mold.id}>
                  {components ? `${mold.name} - ${components}` : mold.name}
                </option>
              );
            })}
          </select>
          <span className="text-xs font-normal text-gray-500">
            Escolha um molde existente para vincular o componente.
          </span>
        </label>
      ) : (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-[#212A4F]">
            Nome do molde
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: M2"
              className="rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none"
            />
          </label>
          {hideMoldFields ? null : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#212A4F]">
                Total de cavidades
                <input
                  type="number"
                  min={1}
                  value={totalCavities}
                  onChange={(event) => setTotalCavities(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#212A4F]">
                Cavidades abertas
                <input
                  type="number"
                  min={0}
                  value={openCavities}
                  onChange={(event) => setOpenCavities(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none"
                />
              </label>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#212A4F]">
              % Refugo
              <input
                type="number"
                min={0}
                step={0.01}
                value={scrap}
                onChange={(event) => setScrap(event.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none"
              />
            </label>
            {hideMoldFields ? null : (
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#212A4F]">
                % Risco de cavidade
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={closedCavityRisk}
                  onChange={(event) => setClosedCavityRisk(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none"
                />
              </label>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="cursor-pointer rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <Button
          title="Salvar"
          type="button"
          disable={submitting}
          isLoading={submitting}
          onClick={onSubmit}
        />
      </div>
    </div>
  );
}

export default FormVincularComponente;
