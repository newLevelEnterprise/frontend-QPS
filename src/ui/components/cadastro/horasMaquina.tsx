import type { IProductionSchedule } from "../../../types/ProductionSchedule";
import { cn } from "../../../utils/cn";

interface HorasMaquinaProps {
  dados: Pick<
    IProductionSchedule,
    "max_deadline_hours" | "machine_status" | "total_machine_hours"
  >;
}

function HorasMaquina({ dados }: HorasMaquinaProps) {
  const { machine_status, max_deadline_hours, total_machine_hours } = dados;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full">
      <h2 className="text-lg font-medium text-purple-600 mb-4">
        Horas de Máquina
      </h2>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Hs. Limite de Entrega</span>
          <span className="text-sm font-medium text-gray-900">
            {new Intl.NumberFormat('pt-BR').format(max_deadline_hours)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Hs. Nec. de Produção</span>
          <span className="text-sm font-medium text-gray-900">
            {new Intl.NumberFormat('pt-BR', { style: 'decimal' }).format(total_machine_hours)}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Status</span>
          {machine_status && (
            <span
              className={cn(
                "text-sm font-medium bg-red-300 px-3 py-1 rounded-4xl text-red-800",
                machine_status === "On Time" && "bg-green-300 text-green-800"
              )}
            >
              {machine_status === "On Time" ? 'No Prazo' : 'Fora do Prazo'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default HorasMaquina;
