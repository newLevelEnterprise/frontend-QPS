import ItensCompras from "../components/itensCompra/itensCompra";
import XlsxUpload from "../components/XlsxUpload";

function ItensCompraPage() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <XlsxUpload
        endpoint="clientes-xlsx"
        cachekey={["get", "all", "clients"]}
      />
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <ItensCompras />
      </div>
    </div>
  );
}

export default ItensCompraPage;
