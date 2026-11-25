import {
  createContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  AJUSTE_DEMANDA_STORAGE_KEY,
  lerAjusteSalvo,
  type IAjusteDemanda,
} from "../ui/components/sequenciamento/steps/ajusteDemanda";

const LAST_STEP = 3;

interface StepContextType {
  activeStep: number;
  nextStep: () => void;
  prevStep: () => void;
  startSteps: boolean;
  setStartSteps: (value: boolean) => void;
  resetSteps: () => void;
  ajusteDemanda: IAjusteDemanda | null;
  setAjusteDemanda: Dispatch<SetStateAction<IAjusteDemanda | null>>;
}

export const StepContext = createContext<StepContextType>(
  {} as StepContextType,
);

function StepContextProvider({ children }: { children: ReactNode }) {
  const [activeStep, setActiveStep] = useState(0);
  const [startSteps, setStartSteps] = useState<boolean>(false);
  const [ajusteDemanda, setAjusteDemanda] = useState<IAjusteDemanda | null>(
    () => lerAjusteSalvo(localStorage.getItem(AJUSTE_DEMANDA_STORAGE_KEY)),
  );

  useEffect(() => {
    if (ajusteDemanda) {
      localStorage.setItem(AJUSTE_DEMANDA_STORAGE_KEY, JSON.stringify(ajusteDemanda));
    } else {
      localStorage.removeItem(AJUSTE_DEMANDA_STORAGE_KEY);
    }
  }, [ajusteDemanda]);

  const nextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, LAST_STEP));
  };

  const prevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const resetSteps = () => {
    setActiveStep(0);
    setStartSteps(false);
    setAjusteDemanda(null);
  };

  const values = {
    activeStep,
    nextStep,
    prevStep,
    startSteps,
    setStartSteps,
    resetSteps,
    ajusteDemanda,
    setAjusteDemanda,
  };

  return <StepContext.Provider value={values}>{children}</StepContext.Provider>;
}

export default StepContextProvider;
