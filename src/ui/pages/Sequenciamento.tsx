import { useEffect, useState } from "react";
import type { IPedido } from "../../types/Pedido";
import { apiClient } from "../../utils/apiClient";
import PedidosParaSequenciamento from "../components/sequenciamento/pedidos.paraSequencimento";
import PedidosDisponiveis from "../components/sequenciamento/PedidosDisponiveis";
import XlsxUpload from "../components/XlsxUpload";

function Sequenciamento() {
  const [orders, setOrders] = useState<IPedido[]>([]);
  const [pedidosSequencimento, setPedidosSequencimento] = useState<IPedido[]>(
    []
  );

  useEffect(() => {
    const getjobs = async () => {
      try {
        const { data } = await apiClient.get<IPedido[]>("/jobs");
        console.log(data);
        setOrders(data ?? []);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        setOrders([]);
      }
    };

    getjobs();
  }, []);

  return (
    <div className="h-full flex flex-col w-full gap-2">
      <XlsxUpload endpoint="jobs-xlsx" />
      <div className="w-full flex flex-col md:flex-row gap-2 h-full">
        <PedidosDisponiveis allOrders={orders} setPedidosSequenciamento={setPedidosSequencimento}/>
        <PedidosParaSequenciamento
          setOrders={setOrders}
          allOrders={pedidosSequencimento}
        />
      </div>
    </div>
  );
}

export default Sequenciamento;
