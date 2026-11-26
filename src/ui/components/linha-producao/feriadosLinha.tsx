import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import type { ICriarFeriadoBody, IEditarFeriadoBody } from "../../../schemas/feriado";
import { NIVEIS_FERIADO } from "../../../schemas/feriado";
import type { IFeriadoType } from "../../../types/Feriado";
import { apiClient } from "../../../utils/apiClient";
import EditarFeriadoForm from "../feriados/formEditarFeriado";
import FormCadastrarFeriado from "../feriados/formCadastrarFeriado";
import Loader from "../Loader";
import Modal from "../modal";

interface FeriadosLinhaProps {
  open: boolean;
  linhaId: string;
  linhaNome?: string;
  onClose: () => void;
}

interface HolidayList {
  items: IFeriadoType[];
  syncFailed: boolean;
}

function isoDate(value: string) {
  return value.slice(0, 10);
}

function formatBrDate(value: string) {
  const [year, month, day] = isoDate(value).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function nivelExibido(item: IFeriadoType) {
  if (item.type === "pause") return "Pausa";
  const known = NIVEIS_FERIADO.find(
    (nivel) => nivel.toUpperCase() === item.level.toUpperCase(),
  );
  return known && known !== "Pausa" ? known : item.level;
}

function corpoFeriado(
  data: { name: string; date: string; level: string },
  productionLineId: number,
) {
  const pausa = data.level === "Pausa";
  return {
    name: data.name.trim(),
    date: isoDate(data.date),
    production_line_id: productionLineId,
    level: pausa ? "Nacional" : data.level,
    type: pausa ? "pause" : "holiday",
  };
}

function errorText(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && error.response?.status === 400) {
    return "Já existe um registro nesta data para a linha.";
  }
  return fallback;
}

function FeriadosLinha({ open, linhaId, linhaNome, onClose }: FeriadosLinhaProps) {
  const queryClient = useQueryClient();
  const productionLineId = Number(linhaId);
  const queryKey = ["get", "line-holidays", linhaId];
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<IFeriadoType | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setMode(null);
    setEditing(null);
    setNotice(null);
  }, [open]);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    enabled: open && Number.isFinite(productionLineId) && productionLineId > 0,
    queryFn: async (): Promise<HolidayList> => {
      let syncFailed = false;
      try {
        await apiClient.post("/holidays/sync-national-automatic", {}, {
          params: { production_line_id: productionLineId },
        });
      } catch {
        syncFailed = true;
      }
      const { data: items } = await apiClient.get<IFeriadoType[]>("/holidays", {
        params: { production_line_id: productionLineId },
      });
      return {
        syncFailed,
        items: [...items].sort(
          (a, b) => isoDate(a.date).localeCompare(isoDate(b.date)) || a.id - b.id,
        ),
      };
    },
  });

  const items = data?.items ?? [];
  const showSyncError = Boolean(data?.syncFailed && items.length === 0);

  const closeForm = () => {
    setMode(null);
    setEditing(null);
    setNotice(null);
  };

  const openCreate = () => {
    setEditing(null);
    setMode("create");
    setNotice(null);
    setFormKey((current) => current + 1);
  };

  const openEdit = (item: IFeriadoType) => {
    setEditing(item);
    setMode("edit");
    setNotice(null);
    setFormKey((current) => current + 1);
  };

  const handleCreate = async (body: ICriarFeriadoBody) => {
    if (items.some((item) => isoDate(item.date) === isoDate(body.date))) {
      setNotice({
        text: "Já existe um registro nesta data para a linha.",
        error: true,
      });
      return;
    }
    try {
      await apiClient.post("/holidays", corpoFeriado(body, productionLineId));
      setMode(null);
      setNotice({ text: "Registro cadastrado.", error: false });
      await queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      setNotice({
        text: errorText(error, "Não foi possível salvar o feriado."),
        error: true,
      });
    }
  };

  const handleEdit = async (body: IEditarFeriadoBody) => {
    if (
      items.some(
        (item) => item.id !== body.id && isoDate(item.date) === isoDate(body.date),
      )
    ) {
      setNotice({
        text: "Já existe um registro nesta data para a linha.",
        error: true,
      });
      return;
    }
    try {
      await apiClient.put(`/holidays/${body.id}`, corpoFeriado(body, productionLineId));
      setMode(null);
      setEditing(null);
      setNotice({ text: "Alterações salvas.", error: false });
      await queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      setNotice({
        text: errorText(error, "Não foi possível salvar o feriado."),
        error: true,
      });
    }
  };

  const handleDelete = async (item: IFeriadoType) => {
    if (!window.confirm(`Excluir "${item.name}"?`)) return;
    setDeletingId(item.id);
    try {
      await apiClient.delete(`/holidays/${item.id}`);
      if (editing?.id === item.id) closeForm();
      setNotice({ text: "Registro excluído.", error: false });
      await queryClient.invalidateQueries({ queryKey });
    } catch {
      setNotice({ text: "Não foi possível excluir o feriado.", error: true });
    } finally {
      setDeletingId(null);
    }
  };

  const closeDialog = () => {
    closeForm();
    onClose();
  };

  return (
    <Modal.Root isVisible={open} full>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feriados-linha-titulo"
        className="flex max-h-[90vh] w-[min(960px,96vw)] flex-col overflow-hidden rounded-xl bg-white text-gray-900 shadow-[0_18px_60px_rgba(16,32,68,0.2)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <h2 id="feriados-linha-titulo" className="text-lg font-bold text-[#5B85D5]">
              Feriados da Linha
            </h2>
            <p className="text-sm text-gray-500">{linhaNome?.trim() || "Linha de produção"}</p>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Fechar"
            className="cursor-pointer px-1 text-[28px] leading-none text-gray-500"
          >
            ×
          </button>
        </div>

        <div className="overflow-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-gray-800">Feriados cadastrados</h3>
            <button
              type="button"
              onClick={openCreate}
              className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Adicionar feriado
            </button>
          </div>

          {mode === "create" && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-slate-50 p-4">
              <h3 className="mb-3 text-base font-semibold text-gray-800">Cadastrar feriado</h3>
              <FormCadastrarFeriado
                key={formKey}
                variant="inline"
                onSubmit={handleCreate}
                onCancel={closeForm}
              />
            </div>
          )}

          {mode === "edit" && editing && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-slate-50 p-4">
              <h3 className="mb-3 text-base font-semibold text-gray-800">Editar feriado</h3>
              <EditarFeriadoForm
                key={formKey}
                variant="inline"
                showDelete={false}
                initialData={{
                  id: editing.id,
                  name: editing.name,
                  date: isoDate(editing.date),
                  level: nivelExibido(editing),
                }}
                onSubmit={handleEdit}
                onCancel={closeForm}
              />
            </div>
          )}

          {notice && (
            <p
              role="status"
              className={`mt-2 text-sm ${notice.error ? "text-red-700" : "text-green-700"}`}
            >
              {notice.text}
            </p>
          )}
          {showSyncError && !notice && (
            <p role="status" className="mt-2 text-sm text-red-700">
              Não foi possível carregar os feriados.
            </p>
          )}
          {isError && (
            <p className="mt-2 text-sm text-red-700">Não foi possível carregar os feriados.</p>
          )}

          {isLoading ? (
            <Loader message="Carregando feriados" />
          ) : !isError ? (
            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3.5 text-left text-sm font-medium text-gray-700">Nome</th>
                    <th className="px-4 py-3.5 text-left text-sm font-medium text-gray-700">Data</th>
                    <th className="px-4 py-3.5 text-left text-sm font-medium text-gray-700">
                      Nível / tipo
                    </th>
                    <th className="px-4 py-3.5 text-left text-sm font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                        Nenhum feriado cadastrado.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200 last:border-b-0">
                        <td className="px-4 py-3.5 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-900">
                          {formatBrDate(item.date)}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-900">{nivelExibido(item)}</td>
                        <td className="px-4 py-3.5 text-sm">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="cursor-pointer rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-blue-600"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              disabled={deletingId === item.id}
                              className="cursor-pointer rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-red-600 disabled:opacity-60"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={closeDialog}
            className="cursor-pointer rounded-md border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal.Root>
  );
}

export default FeriadosLinha;
