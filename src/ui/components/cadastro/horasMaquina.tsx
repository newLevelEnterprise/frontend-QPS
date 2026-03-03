import type { IProductionSchedule } from "../../../types/ProductionSchedule";

interface HorasMaquinaProps {
  dados?: IProductionSchedule["metrics"];
}

function HorasMaquina({ dados }: HorasMaquinaProps) {
  const {
    hs_de_disponibilidade,
    hs_nec_de_producao,
    carga_de_maquina_percent,
  } = dados || {};

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full">
      <h2 className="text-lg font-medium text-purple-600 mb-4">
        Horas de Máquina
      </h2>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Hs. Limite de Entrega</span>
          <span className="text-sm font-medium text-gray-900">
            {new Intl.NumberFormat("pt-BR").format(hs_de_disponibilidade || 0)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Hs. Nec. de Produção</span>
          <span className="text-sm font-medium text-gray-900">
            {new Intl.NumberFormat("pt-BR", { style: "decimal" }).format(
              hs_nec_de_producao || 0,
            )}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Carga Máquina
          </span>
          {carga_de_maquina_percent || 0} %
        </div>
      </div>
    </div>
  );
}

export default HorasMaquina;
