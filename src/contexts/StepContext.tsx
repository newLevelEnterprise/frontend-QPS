import { createContext, useState, type ReactNode } from "react";

interface StepContextType {
  activeStep: number;
  nextStep: () => void;
  prevStep: () => void;
  startSteps: boolean;
  setStartSteps: (value: boolean) => void;
  resetSteps: () => void;
}

export const StepContext = createContext<StepContextType>(
  {} as StepContextType,
);

function StepContextProvider({ children }: { children: ReactNode }) {
  const [activeStep, setActiveStep] = useState(0);
  const [startSteps, setStartSteps] = useState<boolean>(false);

  const nextStep = () => {
    if (activeStep > 2) {
      setActiveStep(2);
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (activeStep < 0) {
      setActiveStep(0);
      return;
    }
    setActiveStep((prev) => prev - 1);
  };

  const resetSteps = () => {
    setActiveStep(0);
    setStartSteps(false);
  };

  const values = {
    activeStep,
    nextStep,
    prevStep,
    startSteps,
    setStartSteps,
    resetSteps,
  };

  return <StepContext.Provider value={values}>{children}</StepContext.Provider>;
}

export default StepContextProvider;
