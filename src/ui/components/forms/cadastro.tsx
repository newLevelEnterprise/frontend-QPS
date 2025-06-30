import { useEffect, useState } from "react";
import type { IProductionSchedule } from "../../../types/ProductionSchedule";
import { apiClient } from "../../../utils/apiClient";
import GraficoFaturamento from "../../components/cadastro/grafico";
import HorasMaquina from "../../components/cadastro/horasMaquina";
import Info from "../../components/cadastro/info";
import Resumo from "../../components/cadastro/resumo";
import SequenciamentoTabela from "../../components/cadastro/sequenciamentoTabela";

function CadastroPage() {
    const [production, setProduction] = useState<IProductionSchedule[]>([]);
  
     
    useEffect(() => {
      const getproduction = async () => {
        try {
          const { data } = await apiClient.get<IProductionSchedule[]>("/production-schedule");
          setProduction(data);
        } catch (error) {
          console.error("Erro ao buscar produções:", error);
          setProduction([]);
        }
      };
  
      getproduction();
    }, []);

  return (
    <div className="h-full flex flex-col w-full gap-1">
      <h1 className="text-lg md:text-xl text-[#878C9B]">
        Painel se Sequenciamento da Produção
      </h1>
      <div className="md:h-[360px] w-full flex md:flex-row flex-col gap-6">
        <div className="w-[98%] md:w-1/6 bg-white rounded-md shadow">
          <Info dados={production.length > 0 ? production[0] : undefined}/>
        </div>
        <SequenciamentoTabela dados={production.length > 0 ? production[0].results : []}/>
      </div>
      <div className="flex-1 flex md:flex-row flex-col gap-6">
        <div className="w-[98%] md:w-1/5 flex flex-col justify-between gap-2">
          <HorasMaquina dados={{
            machine_status: production?.[0]?.machine_status ?? "",
            max_deadline_hours: production?.[0]?.max_deadline_hours ?? 0,
            total_machine_hours: production?.[0]?.total_machine_hours ?? 0
          }}/>
          <Resumo dados={production.length > 0 ? production[0].results : []}/>
        </div>

        <div className="flex-1 overflow-x-auto">
          <GraficoFaturamento dados={production.length > 0 ? production[0].revenue_forecast : []}/>
        </div>
      </div>
    </div>
  );
}

export default CadastroPage;
