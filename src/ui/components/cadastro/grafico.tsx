import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { IProductionSchedule } from "../../../types/ProductionSchedule";

function GraficoFaturamento({
  dados,
}: {
  dados: IProductionSchedule["revenue_forecast"];
}) {
  return (
    <div className="w-full h-full bg-white rounded-lg shadow p-4">
      <h2 className="text-[#5A7BEF] font-bold text-lg">
        Previsão de Faturamento $
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={dados}
          margin={{ top: 50, right: 20, left: 0, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis
            dataKey="billing_date"
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis tickFormatter={(v) => `R$ ${v.toLocaleString("pt-BR")}`} />
          <Tooltip formatter={(v) => `R$ ${v.toLocaleString("pt-BR")}`} />
          <Bar
            dataKey="revenue_total"
            fill="#2382E7"
            barSize={24}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GraficoFaturamento;
