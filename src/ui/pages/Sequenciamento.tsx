import { useState } from "react";
import StepContextProvider from "../../contexts/StepContext";
import PedidosParaSequenciamento from "../components/sequenciamento/pedidos.paraSequencimento";
import PedidosDisponiveis from "../components/sequenciamento/PedidosDisponiveis";
import Steps from "../components/sequenciamento/steps";
import XlsxUpload from "../components/XlsxUpload";

function Sequenciamento() {
  const [startSteps, setStartSteps] = useState(false);

  return (
    <div className="md:h-full flex flex-col w-full gap-2 overflow-y-auto lg:overflow-hidden">
      <XlsxUpload endpoint="jobs-xlsx" cachekey={["get", "jobs"]} />
      <div className="w-full flex flex-col md:flex-row gap-2 max-h-full overflow-y-auto lg:overflow-hidden max-w-full">
        {!startSteps && (
          <>
            <PedidosDisponiveis />
            <PedidosParaSequenciamento setStartSteps={setStartSteps} />
          </>
        )}
        {startSteps && (
          <StepContextProvider>
            <Steps />
          </StepContextProvider>
        )}
      </div>
    </div>
  );
}

export default Sequenciamento;
