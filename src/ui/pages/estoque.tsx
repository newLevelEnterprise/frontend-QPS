import Estoque from "../components/estoque/estoque";

function EstoquePage() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <Estoque />
      </div>
    </div>
  );
}

export default EstoquePage;
