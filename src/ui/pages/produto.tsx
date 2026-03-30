import { useQueryClient } from "@tanstack/react-query";
import XlsxUpload from "../components/XlsxUpload";
import Produtos from "../components/produto/produtos";

function ProdutosPage() {
  const queryClient = useQueryClient();
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <XlsxUpload
        endpoint="products-xlsx"
        onRevalidate={() => {
          queryClient.invalidateQueries({
            queryKey: ["get", "all", "products"],
          });
        }}
      />
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <Produtos />
      </div>
    </div>
  );
}

export default ProdutosPage;
