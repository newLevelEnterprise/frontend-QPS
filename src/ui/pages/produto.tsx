import XlsxUpload from "../components/XlsxUpload";
import Produtos from "../components/produto/produtos";

function ProdutosPage() {
  return (
     <div className="h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <XlsxUpload endpoint="products-xlsx"/>
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <Produtos />
      </div>
    </div>
  );
}

export default ProdutosPage;
