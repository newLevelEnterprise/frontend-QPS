import { useQueryClient } from "@tanstack/react-query";
import XlsxUpload from "../components/XlsxUpload";
import Produtos from "../components/produto/produtos";

function ProdutosPage() {
  const queryClient = useQueryClient();
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <XlsxUpload
        endpoint="products-xlsx"
        hint="Use a planilha com as abas Produtos e Componentes e Pós Injeção. O código do produto comercial fica na coluna A e o do componente na coluna C, inclusive códigos como C-55392. A importação não duplica cadastros. Itens inconsistentes ficam de fora e aparecem no aviso."
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
