import { useState } from "react";
import EstadoAtualMaquina from "./estadoAtualMaquina";
import Paradas from "./paradas";
import SequenciamentoInfo from "./sequenciamentoInfo";

const steps = [
  { content: <SequenciamentoInfo /> },
  { content: <EstadoAtualMaquina /> },
  { content: <Paradas /> },
];

interface StepsProps {
  onInit: () => void;
}

function Steps({ onInit }: StepsProps) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="flex-1 flex flex-col items-end justify-center p-6">
      <div className="w-full h-full">{steps[activeStep].content}</div>
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
          disabled={activeStep === 0}
          className={`px-4 py-2 rounded bg-blue-600 text-white transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer`}
        >
          Voltar
        </button>
        {activeStep < steps.length - 1 ? (
          <button
            onClick={() =>
              setActiveStep((prev) => Math.min(prev + 1, steps.length - 1))
            }
            className="px-4 py-2 rounded bg-blue-600 text-white transition-colors hover:bg-blue-700 cursor-pointer"
          >
            Prosseguir
          </button>
        ) : (
          <button
            onClick={() => {
              onInit();
            }}
            className="px-4 py-2 rounded bg-green-600 text-white transition-colors hover:bg-green-700 cursor-pointer"
          >
            Iniciar
          </button>
        )}
      </div>
    </div>
  );
}

export default Steps;
