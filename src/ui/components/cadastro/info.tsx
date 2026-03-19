import type { IProductionSchedule } from "../../../types/ProductionSchedule";

interface InfoCardProps {
  titulo: string;
  valor: string;
  cor: "azul" | "roxo" | "verde";
}

const cores = {
  azul: "bg-[#5B85D5]",
  roxo: "bg-[#AD81C1]",
  verde: "bg-[#92C181]",
};

const mesesObj: Record<number, string> = {
  0: "Janeiro",
  1: "Fevereiro",
  2: "Março",
  3: "Abril",
  4: "Maio",
  5: "Junho",
  6: "Julho",
  7: "Agosto",
  8: "Setembro",
  9: "Outubro",
  10: "Novembro",
  11: "Dezembro",
};

function InfoCard({ cor, titulo, valor }: InfoCardProps) {
  return (
    <div className="w-full flex justify-center gap-2">
      <div
        className={`w-[55%] text-sm flex items-start justify-start text-center px-2 p-1 text-white shadow-lg rounded-tl-3xl rounded-bl-3xl ${cores[cor]}`}
      >
        <h2>{titulo}</h2>
      </div>
      <div className="w-[35%] flex items-center text-sm text-center px-2 p-1 shadow-lg rounded-tr-3xl rounded-br-3xl border border-[#EAEAEA] truncate text-ellipsis">
        <h2>{valor}</h2>
      </div>
    </div>
  );
}

function Info({ dados }: { dados: IProductionSchedule | undefined }) {
  if (!dados) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <p className="text-xs md:text-base font-medium">
          Nenhum dado encontrado
        </p>
      </div>
    );
  }

  const { sequencing_start, setup_count, id, on_time_jobs } = dados;

  const formatDate = Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(sequencing_start));
  const formatHour = Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(sequencing_start));
  const month = new Date(Date.now()).getMonth();

  return (
    <div className="w-full h-fit flex flex-col py-1 md:pt-1 gap-1 overflow-y-auto">
      <InfoCard titulo="Mês Corrente" cor="azul" valor={mesesObj[month]} />
      <InfoCard titulo="Data Inicio Prog." valor={formatDate} cor="azul" />
      <InfoCard titulo="Hr. Inicio Prog." valor={formatHour} cor="azul" />
      <InfoCard titulo="Qtd. Setup Nec." valor={`${setup_count}`} cor="azul" />
      <InfoCard
        titulo="Pedidos no Prazo"
        valor={`${on_time_jobs}`}
        cor="azul"
      />
      <InfoCard titulo="Hr. de Fat Até:" valor="16:59:00" cor="azul" />
      <InfoCard titulo="ID Sequenciamento" valor={`${id}`} cor="azul" />
    </div>
  );
}

export default Info;
