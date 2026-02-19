import ComposicaoTable from "../components/composicao/composicao";
import XlsxUpload from "../components/XlsxUpload";

function Composicao() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <XlsxUpload
        endpoint="clientes-xlsx"
        cachekey={["get", "all", "clients"]}
      />
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <ComposicaoTable />
      </div>
    </div>
  );
}

export default Composicao;
