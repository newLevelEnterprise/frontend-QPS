import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import StepContextProvider from "../../contexts/StepContext";
import { useSteps } from "../../hooks/useStep";
import type { IPedido } from "../../types/Pedido";
import XlsxUpload from "../components/XlsxUpload";
import Modal from "../components/modal";
import PedidosParaSequenciamento from "../components/sequenciamento/pedidos.paraSequencimento";
import PedidosDisponiveis from "../components/sequenciamento/PedidosDisponiveis";
import {
  JOBS_SELECIONADOS_KEY,
  readPedidosSelecionados,
  writePedidosSelecionados,
} from "../components/sequenciamento/pedidoFormat";
import Steps from "../components/sequenciamento/steps";

function Content() {
  const { startSteps, setStartSteps } = useSteps();
  const queryClient = useQueryClient();
  const [importar, setImportar] = useState(false);
  const [selecionados, setSelecionados] = useState<IPedido[]>(readPedidosSelecionados);

  useEffect(() => {
    if (startSteps) return;
    setSelecionados(readPedidosSelecionados());
  }, [startSteps]);

  const sincronizarCatalogo = useCallback((catalogo: IPedido[]) => {
    setSelecionados((atual) => {
      const proximo = atual.flatMap((item) => {
        const fresco = catalogo.find((job) => job.id === item.id);
        return fresco ? [fresco] : [];
      });
      if (JSON.stringify(proximo) === JSON.stringify(atual)) return atual;
      writePedidosSelecionados(proximo);
      return proximo;
    });
  }, []);

  const selecionar = (pedido: IPedido) => {
    setSelecionados((atual) => {
      if (atual.some((item) => item.id === pedido.id)) return atual;
      if (atual.length >= 30) {
        toast.error("Não é possível adicionar mais de 30 pedidos para sequenciamento", {
          toastId: "addPedidoToast",
        });
        return atual;
      }
      const proximo = [...atual, pedido];
      writePedidosSelecionados(proximo);
      return proximo;
    });
  };

  const remover = (pedido: IPedido) => {
    setSelecionados((atual) => {
      const proximo = atual.filter((item) => item.id !== pedido.id);
      writePedidosSelecionados(proximo);
      return proximo;
    });
  };

  const apagarSelecao = () => {
    localStorage.removeItem(JOBS_SELECIONADOS_KEY);
    setSelecionados([]);
  };

  return (
    <div className="md:h-full flex flex-col w-full gap-2 overflow-y-auto lg:overflow-hidden">
      {!startSteps && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setImportar(true)}
            className="cursor-pointer text-sm px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Importar pedidos XLSX
          </button>
        </div>
      )}
      <Modal.Root isVisible={importar}>
        <Modal.Container>
          <Modal.Header title="Importar pedidos XLSX" onClose={() => setImportar(false)} />
          <XlsxUpload
            endpoint="jobs-xlsx"
            hint="Colunas: Número do Pedido, codigo_cliente, Código do Molde, codigo_produto, Demanda do Pedido, Data Limite de Faturamento, Horário Limite de Faturamento e Valor Unitário (R$/por unidade). Cliente e produto são o código externo cadastrado."
            onClose={() => setImportar(false)}
            onRevalidate={() => {
              queryClient.invalidateQueries({
                queryKey: ["get", "jobs"],
              });
            }}
            mainDivClassName="shadow-none h-auto max-w-3xl bg-transparent p-2 lg:h-auto"
          />
        </Modal.Container>
      </Modal.Root>
      <div className="w-full flex flex-col md:flex-row gap-2 max-h-full overflow-y-auto lg:overflow-hidden max-w-full">
        {!startSteps && (
          <>
            <PedidosDisponiveis
              selecionados={selecionados}
              onSelecionar={selecionar}
              onCatalogo={sincronizarCatalogo}
              onApagarSelecao={apagarSelecao}
            />
            <PedidosParaSequenciamento
              setStartSteps={setStartSteps}
              pedidos={selecionados}
              onRemover={remover}
            />
          </>
        )}
        {startSteps && <Steps />}
      </div>
    </div>
  );
}

function Sequenciamento() {
  return (
    <StepContextProvider>
      <Content />
    </StepContextProvider>
  );
}

export default Sequenciamento;
