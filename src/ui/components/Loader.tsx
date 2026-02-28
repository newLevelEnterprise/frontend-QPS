interface LoaderProps {
  message?: string;
}

function Loader({ message }: LoaderProps) {
  return (
    <div className="w-full flex items-center justify-center mt-6">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-sm text-gray-500">
          {message || "Carregando..."}
        </p>
      </div>
    </div>
  );
}

export default Loader;
