import { useSteps } from "../../../../hooks/useStep";
import EstadoAtualMaquina from "./estadoAtualMaquina";
import Paradas from "./paradas";
import SequenciamentoInfo from "./sequenciamentoInfo";

const steps = [
  { content: <SequenciamentoInfo /> },
  { content: <EstadoAtualMaquina /> },
  { content: <Paradas /> },
];

function Steps() {
  const { activeStep } = useSteps();

  return (
    <div className="flex-1 flex flex-col items-end justify-center p-6">
      <div className="w-full h-full">{steps[activeStep].content}</div>
    </div>
  );
}

export default Steps;
