import XlsxUpload from "../components/XlsxUpload";
import Clientes from "../components/clientes/clientes";

function ClientesPages() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <XlsxUpload
        endpoint="clients-xlsx"
        cachekey={["get", "all", "clients"]}
      />
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <Clientes />
      </div>
    </div>
  );
}

export default ClientesPages;
