import Moldes from "../components/moldes/moldes";

function MoldesPage() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <Moldes />
      </div>
    </div>
  );
}

export default MoldesPage;
