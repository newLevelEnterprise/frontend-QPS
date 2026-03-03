import type { ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import Button from "./Button";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

function AppErrorFallback({ error }: FallbackProps) {
  console.error("Erro capturado pelo ErrorBoundary:", error);

  const handleBackToHome = () => {
    window.location.assign("/cadastro/cliente");
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FC] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-md shadow p-8 flex flex-col gap-5 items-center text-center">
        <h1 className="text-2xl font-bold text-[#255DC8]">
          Ops! Algo deu errado
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Ocorreu um erro inesperado ao carregar este conteúdo.
        </p>
        <Button
          title="Voltar ao início"
          onClick={handleBackToHome}
          type="button"
        />
      </div>
    </div>
  );
}

function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={AppErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

export default AppErrorBoundary;
