import LinhaProducao from "../components/linha-producao/linha-producao";

function LinhaProducaoPage() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <LinhaProducao />
      </div>
    </div>
  );
}

export default LinhaProducaoPage;
