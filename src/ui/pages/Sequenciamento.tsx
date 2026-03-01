import StepContextProvider from "../../contexts/StepContext";
import { useSteps } from "../../hooks/useStep";
import PedidosParaSequenciamento from "../components/sequenciamento/pedidos.paraSequencimento";
import PedidosDisponiveis from "../components/sequenciamento/PedidosDisponiveis";
import Steps from "../components/sequenciamento/steps";
import XlsxUpload from "../components/XlsxUpload";

function Content() {
  const { startSteps, setStartSteps } = useSteps();
  return (
    <div className="w-full flex flex-col md:flex-row gap-2 max-h-full overflow-y-auto lg:overflow-hidden max-w-full">
      {!startSteps && (
        <>
          <PedidosDisponiveis />
          <PedidosParaSequenciamento setStartSteps={setStartSteps} />
        </>
      )}
      {startSteps && <Steps />}
    </div>
  );
}

function Sequenciamento() {
  return (
    <StepContextProvider>
      <div className="md:h-full flex flex-col w-full gap-2 overflow-y-auto lg:overflow-hidden">
        <XlsxUpload endpoint="jobs-xlsx" cachekey={["get", "jobs"]} />
        <Content />
      </div>
    </StepContextProvider>
  );
}

export default Sequenciamento;
