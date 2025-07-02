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
    <div className="w-full h-full bg-white rounded-lg shadow p-4 flex flex-col justify-end items-end">
      <h2 className="text-[#5A7BEF] font-bold text-lg self-start">
        Previsão de Faturamento R$
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={dados.map(p => ({ billing_date: p.billing_date, faturamento_total: p.revenue_total }))}
          margin={{ top: 50, right: 0, left: 30, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis
            dataKey="billing_date"
            angle={-10}
            textAnchor="end"
            height={60}
            tickFormatter={(date) => {
              const d = new Date(date);
              return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d);
            }}
          />
          <YAxis 
            tickFormatter={(v) => Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(v) => Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(v as string))}
            labelFormatter={date => {
              const d = new Date(date);
              return new Intl.DateTimeFormat('pt-BR').format(d);
            }}
          />
          <Bar
            dataKey="faturamento_total"
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