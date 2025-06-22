import { useEffect, useState } from "react";
import type { IProdutoSetup } from "../../../types/Produto";
import Button from "../Button";

interface FormNovoProdutoProps {
  produtos: IProdutoSetup[];
}

function FormSetup({ produtos }: FormNovoProdutoProps) {
  const [setupProdutos, setSetupProdutos] = useState<IProdutoSetup[]>([]);

  const adicionarSetup = () => console.log('Setup',setupProdutos);

  useEffect(() => {
    setSetupProdutos(produtos);
  }, []);

  return (
    <div className="w-full flex flex-col gap-10 my-6 overflow-y-auto max-h-[95%]">
      {setupProdutos.map((produto) => (
        <div
          key={produto.id}
          className="w-full flex justify-between items-center border-b border-gray-300"
        >
          <p>{produto.nomeProdutoDestino}</p>
          <p>Tempo</p>
          <input
            type="number"
            className="p-1 outline-none border border-gray-200 rounded-md mb-2"
            value={produto.tempo_setup}
            onChange={(e) => {
              const index = setupProdutos.findIndex(p => p.id === produto.id);

              setSetupProdutos(prev => {
                const oldProducts = [...prev];
                oldProducts[index] = {
                  ...produto,
                  tempo_setup: Number(e.target.value)
                }
                return oldProducts
              });
            }}
          />
        </div>
      ))} 
      <div className="w-full flex justify-end">
        <Button
          onClick={adicionarSetup}
          title="Ok"
          type="button"
        />
      </div>
    </div>
  );
}

export default FormSetup;
