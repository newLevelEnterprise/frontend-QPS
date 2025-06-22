import type { Dispatch, SetStateAction } from "react";
import type { IProduto } from "../../../types/Produto";

interface FormNovoProdutoProps {
  setProdutos: Dispatch<SetStateAction<IProduto[]>>;
  produtos: IProduto[];
}

function FormSetup({ produtos, setProdutos }: FormNovoProdutoProps) {
  return (
    <div className="w-full flex flex-col gap-10 my-6 overflow-y-auto max-h-[95%]">
      {produtos.map((produto, i) => (
        <div
          key={produto.id}
          className="w-full flex justify-between items-center border-b border-gray-300"
        >
          <p>{produto.name}</p>
          <p>Tempo</p>
          <input
            type="text"
            className="p-1 outline-none border border-gray-200 rounded-md mb-2"
            value={produto.bottleneck}
            onChange={(e) =>
              setProdutos((prev) => {
                const newProds = [...prev];
                newProds[i] = {
                  ...newProds[i],
                  bottleneck: Number(e.target.value),
                };

                return newProds;
              })
            }
          />
        </div>
      ))}
    </div>
  );
}

export default FormSetup;
