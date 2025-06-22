import type { IProductionSchedule } from "../../../types/ProductionSchedule";

interface HorasMaquinaProps {
  dados: Pick<IProductionSchedule, "max_deadline_hours" | "machine_status" | "total_machine_hours">
}

function HorasMaquina({ dados }: HorasMaquinaProps) {
  const {
    machine_status,
    max_deadline_hours,
    total_machine_hours
  } = dados;

  return (
     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full">
      <h2 className="text-lg font-medium text-purple-600 mb-4">Horas de Máquina Gargalo</h2>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Prazo Máximo de Entrega</span>
          <span className="text-sm font-medium text-gray-900">{max_deadline_hours}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Horas Nec. e Máquina</span>
          <span className="text-sm font-medium text-gray-900">{total_machine_hours}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Status</span>
          <span className="text-sm font-medium text-gray-800">{machine_status}</span>
        </div>
      </div>
    </div>
  )
}

export default HorasMaquina