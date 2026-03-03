import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { IProductionSchedule } from "../../types/ProductionSchedule";
import { apiClient } from "../../utils/apiClient";
import Button from "../components/Button";
import GantChart from "../components/cadastro/ganntChart";
import GraficoFaturamento from "../components/cadastro/grafico";
import HorasMaquina from "../components/cadastro/horasMaquina";
import Info from "../components/cadastro/info";
import Resumo from "../components/cadastro/resumo";
import SequenciamentoTabela from "../components/cadastro/sequenciamentoTabela";
import Modal from "../components/modal";

function CadastroPage() {
  const [searchParams] = useSearchParams();
  const [production, setProduction] = useState<IProductionSchedule | null>(
    null,
  );
  const [isGanttModalOpen, setIsGanttModalOpen] = useState(false);
  const [isMaisInfoModalOpen, setIsMaisInfoModalOpen] = useState(false);

  useEffect(() => {
    const getproduction = async () => {
      try {
        let endpoint = "/production-schedule/latest";

        if (searchParams.get("id")) {
          endpoint = `/production-schedule/${searchParams.get("id")}`;
        }
        const { data } = await apiClient.get<IProductionSchedule>(endpoint);
        setProduction(data);
      } catch (error) {
        console.error("Erro ao buscar produções:", error);
        setProduction(null);
      }
    };

    getproduction();
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="flex flex-col gap-4 pb-4">
        <h1 className="text-lg md:text-xl text-[#878C9B]">
          Dashboard de Resultados
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button
            title="Visualização do gráfico de Gantt"
            onClick={() => setIsGanttModalOpen(true)}
          />
          <Button
            title="Visualizar mais informações"
            onClick={() => setIsMaisInfoModalOpen(true)}
          />
        </div>

        <section className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-4 items-stretch">
          <div className="min-w-0 bg-white rounded-md shadow">
            <Info dados={production ? production : undefined} />
          </div>
          <div className="min-w-0">
            <SequenciamentoTabela
              dados={production ? production.results : []}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)] gap-4 items-stretch">
          <div className="min-w-0 flex flex-col gap-4">
            <HorasMaquina dados={production?.metrics || undefined} />
            <Resumo dados={production ? production.results : []} />
          </div>

          <div className="min-w-0 overflow-x-auto">
            <GraficoFaturamento
              dados={production ? production.revenue_forecast : []}
            />
          </div>
        </section>
      </div>

      <Modal.Root isVisible={isGanttModalOpen}>
        <Modal.Container>
          <Modal.Header
            title="Visualização do gráfico de Gantt"
            onClose={() => setIsGanttModalOpen(false)}
          />
          <GantChart />
        </Modal.Container>
      </Modal.Root>

      <Modal.Root isVisible={isMaisInfoModalOpen}>
        <Modal.Container>
          <Modal.Header
            title="Mais informações"
            onClose={() => setIsMaisInfoModalOpen(false)}
          />
          <div className="mt-4">
            <h1>Teste123</h1>
          </div>
        </Modal.Container>
      </Modal.Root>
    </div>
  );
}

export default CadastroPage;
