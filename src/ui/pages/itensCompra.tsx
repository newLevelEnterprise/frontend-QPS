import ItensCompras from "../components/itensCompra/itensCompra";

function ItensCompraPage() {
  return (
    <div className="md:h-full flex flex-col w-full gap-2 relative overflow-hidden">
      <div className="w-full flex gap-2 h-full overflow-hidden">
        <ItensCompras />
      </div>
    </div>
  );
}

export default ItensCompraPage;
