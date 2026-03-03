import ComposicaoTable from "../components/composicao/composicao";

function Composicao() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <ComposicaoTable />
      </div>
    </div>
  );
}

export default Composicao;
