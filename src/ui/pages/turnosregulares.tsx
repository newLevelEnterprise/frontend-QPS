import TurnosRegulares from "../components/turnosRegulares/tunos-regulares";

function TurnosRegularesPage() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <TurnosRegulares />
      </div>
    </div>
  );
}

export default TurnosRegularesPage;
