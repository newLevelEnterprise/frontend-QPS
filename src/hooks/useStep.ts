import { use } from "react";
import { StepContext } from "../contexts/StepContext";

export const useSteps = () => {
  const ctx = use(StepContext);

  if (!ctx) {
    throw new Error("useSteps must be used within a StepProvider");
  }

  return ctx;
};
