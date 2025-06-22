import type { IProductionSchedule } from "../../../types/ProductionSchedule";


function Resumo({ dados }: {dados: IProductionSchedule['results']}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full relative overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium text-blue-600 mb-4">Resumo Geral</h2>

        <div className="overflow-y-auto h-[130px]">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-200">
                <th className="text-left pb-2 font-medium">Clientes</th>
                <th className="text-left pb-2 font-medium">Volume de Peças</th>
                <th className="text-left pb-2 font-medium">Faturamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dados.map((item) => (
                <tr key={item.job_id} className="text-sm">
                  <td className="py-2 text-gray-900">{item.client_name}</td>
                  <td className="py-2 text-gray-700">{item.quantity}</td>
                  <td className="py-2 text-gray-700">{item.expected_revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="border-t-2 border-gray-300">
          <div className="text-sm font-medium flex justify-between">
            <span className="py-2 text-gray-900">Total: </span>
            <span className="py-2 text-gray-900">165.000,00</span>
            <span className="py-2 text-gray-900">R$ 567.650,00</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Resumo;
