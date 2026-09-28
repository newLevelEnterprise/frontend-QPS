import TempoProducao from "../components/tempo-producao/tempo-producao";

function TempoCicloPage() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <div className="w-full flex gap-2 h-full min-h-0 overflow-hidden">
        <TempoProducao />
      </div>
    </div>
  );
}

export default TempoCicloPage;
