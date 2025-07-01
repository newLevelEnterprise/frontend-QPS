import { BiLoaderAlt } from "react-icons/bi";

function Loading() {
  return (
    <div className="flex flex-col justify-center items-center w-[55%] gap-4 mx-auto z-30">
      <p className="text-center text-2xl text-[#47506F]">Carregando ...</p>
      <p className="text-center text-sm text-[#47506F]">
        Em instantes você terá o resultado do sequencitamento
      </p>
      <BiLoaderAlt   size={70} className="animate-spin"/>
    </div>
  );
}

export default Loading;
