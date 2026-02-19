import XlsxUpload from "../components/XlsxUpload";
import Maquinas from "../components/maquinas/maquinas";

function MaquinasPages() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <XlsxUpload
        endpoint="clientes-xlsx"
        cachekey={["get", "all", "clients"]}
      />
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <Maquinas />
      </div>
    </div>
  );
}

export default MaquinasPages;
