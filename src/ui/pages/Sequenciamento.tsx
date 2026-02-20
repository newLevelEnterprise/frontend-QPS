import Paradas from "../components/sequenciamento/steps/paradas";
import XlsxUpload from "../components/XlsxUpload";

function Sequenciamento() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 overflow-y-auto lg:overflow-hidden">
      <XlsxUpload endpoint="jobs-xlsx" cachekey={["get", "jobs"]} />
      <div className="w-full flex flex-col md:flex-row gap-2 max-h-full overflow-y-auto lg:overflow-hidden max-w-full">
        {/* <PedidosDisponiveis /> */}
        {/* <PedidosParaSequenciamento /> */}
        {/* <EstadoAtualMaquina /> */}
        <Paradas />
      </div>
      <div className="flex justify-end items-center">
        <button className="bg-blue-400 text-white text-sm py-1 px-4 cursor-pointer hover:bg-blue-300 transition-all duration-150 rounded">
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default Sequenciamento;
