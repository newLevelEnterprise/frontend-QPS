import { LuLoaderCircle } from "react-icons/lu";

function Loading() {
  return (
    <div className="flex flex-col justify-center items-center w-full max-w-md gap-5 mx-auto z-30 bg-white/90 rounded-xl shadow-lg p-8 border border-blue-100 animate-fade-in">
      <LuLoaderCircle size={80} className="animate-spin text-blue-500 mb-2" />
      <p className="text-center text-2xl font-semibold text-blue-700">
        Carregando...
      </p>
      <p className="text-center text-base text-blue-500">
        Em instantes você terá o resultado do sequenciamento.
      </p>
    </div>
  );
}

export default Loading;
