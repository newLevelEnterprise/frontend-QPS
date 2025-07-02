import { useState } from "react";
import type { IPedido } from "../../types/Pedido";
import PedidosParaSequenciamento from "../components/sequenciamento/pedidos.paraSequencimento";
import PedidosDisponiveis from "../components/sequenciamento/PedidosDisponiveis";
import XlsxUpload from "../components/XlsxUpload";

function Sequenciamento() {
  const [pedidosSequencimento, setPedidosSequencimento] = useState<IPedido[]>(
    []
  );
  const [todosPedidos, setTodosPedidos] = useState<IPedido[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<IPedido[]>([]);

  return (
    <div className="md:h-full flex flex-col w-full gap-2 overflow-y-auto lg:overflow-hidden">
      <XlsxUpload endpoint="jobs-xlsx" />
      <div className="w-full flex flex-col md:flex-row gap-2 max-h-full overflow-y-auto lg:overflow-hidden">
        <PedidosDisponiveis
          pedidosFiltrados={pedidosFiltrados}
          setPedidosFiltrados={setPedidosFiltrados}
          setTodosPedidos={setTodosPedidos}
          todosPedidos={todosPedidos} 
          setPedidosSequenciamento={setPedidosSequencimento}
        />

        <PedidosParaSequenciamento
          setTodosPedidosDisponiveis={setTodosPedidos}
          setOrders={setPedidosSequencimento}
          allOrders={pedidosSequencimento}
        />
      </div>
    </div>
  );
}

export default Sequenciamento;
