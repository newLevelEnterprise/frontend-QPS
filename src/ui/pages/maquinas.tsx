import Maquinas from "../components/maquinas/maquinas";

function MaquinasPages() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <Maquinas />
      </div>
    </div>
  );
}

export default MaquinasPages;
