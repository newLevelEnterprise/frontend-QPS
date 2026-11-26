import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import type { IEstoqueImportacao, IEstoqueInsumo, IEstoqueNwSync } from "../../../types/Estoque";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";

const TIPO_LABEL: Record<string, string> = {
  materia_prima: "Matéria-Prima",
  item_compra: "Item de Compra",
  produto: "Produto",
};

const TIPOS_ESTOQUE: IEstoqueInsumo["tipo"][] = [
  "materia_prima",
  "item_compra",
  "produto",
];

function itemJaCadastrado(item: IEstoqueInsumo) {
  return item.source != null || item.ultima_atualizacao != null;
}

function importErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return "Erro ao importar a planilha.";
  const detail = error.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const text = detail
      .map((item) =>
        item && typeof item === "object" && "msg" in item && typeof item.msg === "string"
          ? item.msg
          : "",
      )
      .filter(Boolean)
      .join(" ");
    if (text) return text;
  }
  return "Erro ao importar a planilha.";
}

function formatMissingIds(result: IEstoqueImportacao) {
  if (!result.ids_nao_encontrados.length) return "";
  return result.ids_nao_encontrados
    .map((item) => `${TIPO_LABEL[item.tipo] ?? item.tipo} ${item.id_insumo}`)
    .join(", ");
}

function Estoque() {
  const queryClient = useQueryClient();
  const [importar, setImportar] = useState(false);
  const [manual, setManual] = useState(false);
  const [tipoManual, setTipoManual] = useState<IEstoqueInsumo["tipo"] | "">("");
  const [materialId, setMaterialId] = useState("");
  const [quantidadeManual, setQuantidadeManual] = useState("");
  const [estoqueMinimoManual, setEstoqueMinimoManual] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [resumo, setResumo] = useState<IEstoqueImportacao | null>(null);

  const { data: estoque, isFetching } = useQuery({
    queryKey: ["get", "all", "inventory-stock"],
    queryFn: async () => {
      const { data } = await apiClient.get<IEstoqueInsumo[]>("/inventory-stock");
      return data;
    },
  });

  const atualizarNw = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<IEstoqueNwSync>("/inventory-stock/sync-nw");
      return data;
    },
    onSuccess: (data) => {
      toast.info(data.message);
    },
    onError: () => {
      toast.error("Não foi possível consultar a integração NW.");
    },
  });

  const importarPlanilha = useMutation({
    mutationFn: async (file: File) => {
      const { data } = await apiClient.postForm<IEstoqueImportacao>("/inventory-stock/import", {
        file,
      });
      return data;
    },
    onSuccess: (data) => {
      setResumo(data);
      queryClient.invalidateQueries({ queryKey: ["get", "all", "inventory-stock"] });
      const missing = formatMissingIds(data);
      if (data.linhas_com_erro > 0) {
        toast.error(
          missing
            ? `IDs não encontrados: ${missing}`
            : `${data.linhas_com_erro} linha(s) com erro.`,
        );
      } else {
        toast.success("Estoque importado com sucesso.");
      }
    },
    onError: (error) => {
      toast.error(importErrorMessage(error));
    },
  });

  const exportarEstoque = useMutation({
    mutationFn: async () => {
      const response = await apiClient.get<Blob>("/inventory-stock/export", {
        responseType: "blob",
      });
      const disposition = String(response.headers["content-disposition"] ?? "");
      const filename =
        disposition.match(/filename="([^"]+)"/)?.[1] || "estoque_insumos.xlsx";
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: async (error) => {
      let message = "Erro ao exportar o estoque.";
      if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        try {
          const payload = JSON.parse(await error.response.data.text());
          if (typeof payload.detail === "string" && payload.detail.trim()) {
            message = payload.detail;
          }
        } catch {
          message = "Erro ao exportar o estoque.";
        }
      }
      toast.error(message);
    },
  });

  const adicionarManual = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<IEstoqueImportacao>("/inventory-stock/manual", {
        tipo: tipoManual,
        id_insumo: Number(materialId),
        quantidade_atual: quantidadeManual,
        estoque_minimo: estoqueMinimoManual,
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.linhas_com_erro > 0) {
        toast.error(data.erros[0]?.motivo || "Não foi possível atualizar o estoque.");
        return;
      }
      toast.success("Estoque atualizado.");
      setManual(false);
      setTipoManual("");
      setMaterialId("");
      setQuantidadeManual("");
      setEstoqueMinimoManual("");
      queryClient.invalidateQueries({ queryKey: ["get", "all", "inventory-stock"] });
    },
    onError: () => {
      toast.error("Não foi possível atualizar o estoque.");
    },
  });

  const closeImport = () => {
    setImportar(false);
    setArquivo(null);
    setResumo(null);
  };

  return (
    <div className="w-full bg-white rounded-md shadow p-4 overflow-auto">
      <Modal.Root isVisible={importar}>
        <Modal.Container>
          <Modal.Header title="Importar Planilha" onClose={closeImport} />
          <div className="flex flex-col gap-4 my-6 min-w-[320px]">
            <p className="text-sm text-gray-600">
              Use a planilha exportada. Ela aceita tipo, id_insumo ou codigo,
              quantidade_atual e estoque_minimo. O tipo pode ser materia_prima,
              item_compra ou produto.
            </p>
            <label className="text-sm text-gray-700 flex flex-col gap-2">
              Planilha
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(event) => {
                  setArquivo(event.target.files?.[0] ?? null);
                  setResumo(null);
                }}
              />
            </label>
            {arquivo && (
              <p className="text-sm text-gray-700">Arquivo selecionado: {arquivo.name}</p>
            )}
            {resumo && (
              <div className="text-sm text-gray-700 flex flex-col gap-1">
                <span>Linhas processadas: {resumo.linhas_processadas}</span>
                <span>Linhas atualizadas: {resumo.linhas_atualizadas}</span>
                <span>Linhas com erro: {resumo.linhas_com_erro}</span>
                {resumo.ids_nao_encontrados.length > 0 && (
                  <span>IDs não encontrados: {formatMissingIds(resumo)}</span>
                )}
                {resumo.erros.map((erro, index) => (
                  <span key={`${erro.linha ?? "linha"}-${index}`}>{erro.motivo}</span>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!arquivo || importarPlanilha.isPending}
                onClick={() => arquivo && importarPlanilha.mutate(arquivo)}
                className="cursor-pointer text-sm inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-full"
              >
                {importarPlanilha.isPending ? "Importando..." : "Importar"}
              </button>
            </div>
          </div>
        </Modal.Container>
      </Modal.Root>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl text-[#5B85D5] font-bold">Estoque</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={atualizarNw.isPending}
            onClick={() => atualizarNw.mutate()}
            className="cursor-pointer text-sm inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-full"
          >
            Atualizar pela NW
          </button>
          <button
            type="button"
            onClick={() => setManual(true)}
            className="cursor-pointer text-sm inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full"
          >
            Adicionar manualmente
          </button>
          <button
            type="button"
            onClick={() => setImportar(true)}
            className="cursor-pointer text-sm inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full"
          >
            Importar Planilha
          </button>
          <button
            type="button"
            disabled={exportarEstoque.isPending}
            onClick={() => exportarEstoque.mutate()}
            className="cursor-pointer text-sm inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-full"
          >
            Exportar Estoque
          </button>
        </div>
      </div>

      <Modal.Root isVisible={manual}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar manualmente"
            onClose={() => {
              setManual(false);
              setTipoManual("");
              setMaterialId("");
              setQuantidadeManual("");
              setEstoqueMinimoManual("");
            }}
          />
          <form
            className="flex flex-col gap-4 my-6 min-w-[320px]"
            onSubmit={(event) => {
              event.preventDefault();
              if (!tipoManual || !materialId || quantidadeManual === "" || estoqueMinimoManual === "") {
                return;
              }
              const escolhido = estoque?.find(
                (item) => item.tipo === tipoManual && String(item.id_insumo) === materialId,
              );
              if (escolhido && itemJaCadastrado(escolhido)) return;
              adicionarManual.mutate();
            }}
          >
            <label className="text-sm text-gray-700 flex flex-col gap-1">
              Categoria
              <select
                className="border border-gray-300 rounded-lg p-2"
                value={tipoManual}
                onChange={(event) => {
                  setTipoManual(event.target.value as IEstoqueInsumo["tipo"] | "");
                  setMaterialId("");
                }}
              >
                <option value="">Selecione</option>
                {TIPOS_ESTOQUE.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {TIPO_LABEL[tipo]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-gray-700 flex flex-col gap-1">
              {tipoManual ? TIPO_LABEL[tipoManual] : "Item"}
              <select
                className="border border-gray-300 rounded-lg p-2 disabled:bg-gray-100"
                value={materialId}
                disabled={!tipoManual}
                onChange={(event) => setMaterialId(event.target.value)}
              >
                <option value="">
                  {tipoManual ? "Selecione" : "Selecione a categoria"}
                </option>
                {estoque
                  ?.filter((item) => item.tipo === tipoManual)
                  .map((item) => {
                    const bloqueado = itemJaCadastrado(item);
                    const nome = item.codigo ? `${item.codigo} — ${item.nome}` : item.nome;
                    return (
                      <option
                        key={`${item.tipo}-${item.id_insumo}`}
                        value={item.id_insumo}
                        disabled={bloqueado}
                      >
                        {bloqueado ? `${nome} — já cadastrado` : nome}
                      </option>
                    );
                  })}
              </select>
            </label>
            <label className="text-sm text-gray-700 flex flex-col gap-1">
              Quantidade em estoque
              <input
                type="number"
                step="0.0001"
                min="0"
                className="border border-gray-300 rounded-lg p-2"
                value={quantidadeManual}
                onChange={(event) => setQuantidadeManual(event.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700 flex flex-col gap-1">
              Estoque mínimo
              <input
                type="number"
                step="0.0001"
                min="0"
                className="border border-gray-300 rounded-lg p-2"
                value={estoqueMinimoManual}
                onChange={(event) => setEstoqueMinimoManual(event.target.value)}
              />
            </label>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  !tipoManual ||
                  !materialId ||
                  quantidadeManual === "" ||
                  estoqueMinimoManual === "" ||
                  adicionarManual.isPending
                }
                className="cursor-pointer text-sm inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-full"
              >
                {adicionarManual.isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </Modal.Container>
      </Modal.Root>

      {isFetching && <Loader message="Carregando estoque" />}
      {!isFetching && (
        <div className="flex flex-col gap-6">
          <EstoqueTabela
            titulo="Matéria Prima"
            colunaNome="Matéria Prima"
            itens={estoque?.filter((item) => item.tipo === "materia_prima") ?? []}
          />
          <EstoqueTabela
            titulo="Item de Compra"
            colunaNome="Item"
            itens={estoque?.filter((item) => item.tipo === "item_compra") ?? []}
          />
          <EstoqueTabela
            titulo="Produto"
            colunaNome="Produto"
            itens={estoque?.filter((item) => item.tipo === "produto") ?? []}
          />
        </div>
      )}
    </div>
  );
}

function EstoqueTabela({
  titulo,
  colunaNome,
  itens,
}: {
  titulo: string;
  colunaNome: string;
  itens: IEstoqueInsumo[];
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-[#212A4F]">{titulo}</h2>
      <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-fit max-h-[470px] overflow-x-auto">
        <table className="w-full overflow-auto max-h-[470px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                Código
              </th>
              <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                {colunaNome}
              </th>
              <th className="px-6 py-4 text-center text-xs md:text-sm font-medium text-gray-700">
                Quantidade em estoque
              </th>
              <th className="px-6 py-4 text-center text-xs md:text-sm font-medium text-gray-700">
                Estoque mínimo
              </th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr
                key={`${item.tipo}-${item.id_insumo}`}
                className="border-b border-gray-200 last:border-b-0"
              >
                <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                  {item.codigo || "—"}
                </td>
                <td className="px-6 py-4 text-xs md:text-sm text-gray-900">{item.nome}</td>
                <td className="px-6 py-4 text-xs md:text-sm text-gray-900 text-center">
                  {item.quantidade_atual}
                </td>
                <td className="px-6 py-4 text-xs md:text-sm text-gray-900 text-center">
                  {item.estoque_minimo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Estoque;
