import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "react-toastify";
import { useSteps } from "../../../../hooks/useStep";
import { apiClient } from "../../../../utils/apiClient";
import Loader from "../../Loader";
import {
  campoKey,
  formatarQuantidade,
  mesmaSelecao,
  montarAjuste,
  pedidoKey,
  validarAjuste,
  type IDemandaPedidoPreview,
  type IPedidoAjuste,
} from "./ajusteDemanda";

const lerJobIds = (): number[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem("jobs_ids") ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => Number.isInteger(id))
      : [];
  } catch {
    return [];
  }
};

const th = "border-b border-gray-200 px-3 py-4 text-sm font-semibold text-gray-700";
const td = "border-b border-gray-200 px-3 py-4 text-sm text-gray-900";
const nestedTh = "border-b border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-700";
const nestedTd = "border-b border-gray-100 px-3 py-3 text-sm text-gray-900";
const inputQuantidade =
  "w-32 rounded border border-gray-300 px-2 py-1 text-right disabled:bg-gray-100 disabled:text-gray-500";

function AjusteDemanda() {
  const { nextStep, resetSteps, ajusteDemanda, setAjusteDemanda } = useSteps();
  const jobIds = useMemo(lerJobIds, []);
  const [aberto, setAberto] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const tabelaRef = useRef<HTMLDivElement>(null);

  const { data: preview, isFetching, error } = useQuery({
    queryKey: ["solver", "demand-preview", jobIds],
    queryFn: async () => {
      const { data } = await apiClient.post<{ orders: IDemandaPedidoPreview[] }>(
        "/solver/demand-preview",
        { job_ids: jobIds },
      );
      return data.orders;
    },
    enabled: jobIds.length > 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!preview) return;
    setAjusteDemanda((atual) => ({
      jobIds,
      pedidos: montarAjuste(preview, mesmaSelecao(atual, jobIds) ? atual.pedidos : []),
    }));
  }, [preview, jobIds, setAjusteDemanda]);

  useEffect(() => {
    if (!error) return;
    const detail = isAxiosError(error) ? error.response?.data?.detail : null;
    toast.error(
      typeof detail === "string" ? detail : "Não foi possível carregar os pedidos selecionados.",
      { toastId: "demandPreviewToast" },
    );
  }, [error]);

  const pedidos = mesmaSelecao(ajusteDemanda, jobIds) ? ajusteDemanda.pedidos : [];

  const atualizarPedido = (key: string, mudar: (pedido: IPedidoAjuste) => IPedidoAjuste) => {
    setErro(null);
    setAjusteDemanda((atual) =>
      atual
        ? {
            ...atual,
            pedidos: atual.pedidos.map((pedido) =>
              pedidoKey(pedido) === key ? mudar(pedido) : pedido,
            ),
          }
        : atual,
    );
  };

  const atualizarComponente = (
    key: string,
    componenteId: number,
    mudanca: { fabricar?: boolean; quantidade?: string },
  ) =>
    atualizarPedido(key, (pedido) => ({
      ...pedido,
      componentes: pedido.componentes.map((componente) =>
        componente.component_product_id === componenteId
          ? { ...componente, ...mudanca }
          : componente,
      ),
    }));

  const prosseguir = () => {
    const falha = validarAjuste(pedidos);
    if (!falha) {
      setErro(null);
      nextStep();
      return;
    }
    if (falha.tipo !== "quantidade" || !falha.pedido) {
      if (falha.pedido) flushSync(() => setAberto(falha.pedido ?? null));
      setErro(falha.mensagem);
      return;
    }
    if (falha.componente !== undefined) {
      flushSync(() => setAberto(falha.pedido ?? null));
    }
    const campo = tabelaRef.current?.querySelector<HTMLInputElement>(
      `[data-ajuste="${campoKey(falha.pedido, falha.componente)}"]`,
    );
    if (campo && !campo.checkValidity()) {
      setErro(null);
      campo.reportValidity();
      return;
    }
    campo?.focus();
    setErro(falha.mensagem);
  };

  const cancelar = () => {
    if (!window.confirm("Cancelar sequenciamento?")) return;
    localStorage.removeItem("sequenciamento_info");
    localStorage.removeItem("estado_atual_maquina");
    localStorage.removeItem("jobs_ids");
    resetSteps();
  };

  return (
    <div className="bg-white w-full overflow-y-auto max-h-full rounded-lg p-4">
      <h2 className="text-[#3573C9] text-lg font-bold mb-2">Ajuste da Demanda</h2>

      {isFetching && pedidos.length === 0 ? (
        <Loader message="Carregando pedidos" />
      ) : (
        <div ref={tabelaRef} className="overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className={th}>Código do produto</th>
                <th className={th}>Produto</th>
                <th className={th}>Componente</th>
                <th className={th}>Pedido</th>
                <th className={`${th} text-right`}>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => {
                const key = pedidoKey(pedido);
                const composto = pedido.kind === "compound";
                const expandido = composto && aberto === key;

                return (
                  <Fragment key={key}>
                    <tr>
                      <td className={td}>{pedido.product_code || "—"}</td>
                      <td className={td}>{pedido.product_name}</td>
                      <td className={td}>
                        {composto && (
                          <button
                            type="button"
                            aria-expanded={expandido}
                            onClick={() => setAberto(expandido ? null : key)}
                            className="cursor-pointer text-sm font-medium text-blue-600 transition-colors duration-150 hover:text-blue-800"
                          >
                            {expandido ? "Ocultar composição" : "Mostrar composição"}
                          </button>
                        )}
                      </td>
                      <td className={td}>{pedido.order_number || "—"}</td>
                      <td className={`${td} text-right`}>
                        {composto ? (
                          formatarQuantidade(pedido.demand)
                        ) : (
                          <input
                            type="number"
                            min={1}
                            step={1}
                            required
                            data-ajuste={campoKey(key)}
                            aria-label={`Quantidade ${pedido.product_name}`}
                            className={inputQuantidade}
                            value={pedido.quantidade}
                            onChange={(event) =>
                              atualizarPedido(key, (atual) => ({
                                ...atual,
                                quantidade: event.target.value,
                              }))
                            }
                          />
                        )}
                      </td>
                    </tr>
                    {expandido && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="border-b border-gray-200 px-6 py-3">
                          <table className="w-full border-collapse overflow-hidden rounded-md border border-gray-200 bg-white text-left">
                            <thead>
                              <tr>
                                <th className={`${nestedTh} w-24 text-center`}>Fabricar</th>
                                <th className={nestedTh}>Código do produto</th>
                                <th className={nestedTh}>Componente</th>
                                <th className={nestedTh}>Pedido</th>
                                <th className={`${nestedTh} text-right`}>Quantidade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pedido.componentes.map((componente) => (
                                <tr key={componente.component_product_id}>
                                  <td className={`${nestedTd} text-center`}>
                                    <input
                                      type="checkbox"
                                      aria-label={`Fabricar ${componente.name}`}
                                      className="h-4 w-4 accent-[#3573C9]"
                                      checked={componente.fabricar}
                                      onChange={(event) =>
                                        atualizarComponente(key, componente.component_product_id, {
                                          fabricar: event.target.checked,
                                        })
                                      }
                                    />
                                  </td>
                                  <td className={nestedTd}>{componente.product_code || "—"}</td>
                                  <td className={nestedTd}>{componente.name}</td>
                                  <td className={nestedTd}>{pedido.order_number || "—"}</td>
                                  <td className={`${nestedTd} text-right`}>
                                    <input
                                      type="number"
                                      min={1}
                                      step={1}
                                      required
                                      disabled={!componente.fabricar}
                                      data-ajuste={campoKey(key, componente.component_product_id)}
                                      aria-label={`Quantidade ${componente.name}`}
                                      className={inputQuantidade}
                                      value={componente.quantidade}
                                      onChange={(event) =>
                                        atualizarComponente(key, componente.component_product_id, {
                                          quantidade: event.target.value,
                                        })
                                      }
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {erro && (
        <div role="alert" className="mt-2 text-xs text-red-700">
          {erro}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={cancelar}
          className="px-4 py-2 rounded bg-gray-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
        >
          Cancelar Sequenciamento
        </button>
        <button
          disabled={isFetching || pedidos.length === 0}
          onClick={prosseguir}
          className="px-4 py-2 rounded bg-blue-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default AjusteDemanda;
