import Insumos from "../components/insumos/insumos";

function MateriaPrimaPage() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <Insumos />
      </div>
    </div>
  );
}

export default MateriaPrimaPage;
