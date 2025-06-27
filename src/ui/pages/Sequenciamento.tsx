import { useState } from "react";
import type { IPedido } from "../../types/Pedido";
import PedidosParaSequenciamento from "../components/sequenciamento/pedidos.paraSequencimento";
import PedidosDisponiveis from "../components/sequenciamento/PedidosDisponiveis";
import XlsxUpload from "../components/XlsxUpload";

function Sequenciamento() {
  const [pedidosSequencimento, setPedidosSequencimento] = useState<IPedido[]>(
    []
  );

  return (
    <div className="md:h-full flex flex-col w-full gap-2 overflow-y-auto lg:overflow-hidden">
      <XlsxUpload endpoint="jobs-xlsx" />
      <div className="w-full flex flex-col md:flex-row gap-2 h-full overflow-y-auto lg:overflow-hidden">
        <PedidosDisponiveis setPedidosSequenciamento={setPedidosSequencimento}/>
        <PedidosParaSequenciamento
          setOrders={setPedidosSequencimento}
          allOrders={pedidosSequencimento}
        />
      </div>
    </div>
  );
}

export default Sequenciamento;
