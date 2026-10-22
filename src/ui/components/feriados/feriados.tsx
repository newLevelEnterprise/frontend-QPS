import { Link } from "react-router-dom";

function Feriados() {
  return (
    <div className="w-full flex flex-col rounded-md shadow p-4 overflow-auto bg-white">
      <h1 className="text-xl text-[#5B85D5] font-bold">Calendário</h1>
      <p className="mt-4 text-gray-700 max-w-xl">
        Indisponibilidades ficam em outra etapa do sistema. O calendário de cada linha mostra apenas os horários regulares de operação.
      </p>
      <Link
        to="/cadastro/linhas-producao"
        className="mt-6 inline-flex w-fit px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        Ir para linhas de produção
      </Link>
    </div>
  );
}

export default Feriados;
