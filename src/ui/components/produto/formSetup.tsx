import { type Dispatch, useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { VscLoading } from "react-icons/vsc";
import { toast } from "react-toastify";
import type { IProdutoSetup } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";

export interface ResponseOfProductsSetups {
  id: number;
  setup_time: number;
  pair_product: {
    id: number;
    name: string;
  };
}

interface FormNovoProdutoProps {
  produto_ref: number;
  onClose: Dispatch<
    React.SetStateAction<{
      nome: string;
      id: number;
    } | null>
  >;
}

function FormSetup({ produto_ref, onClose }: FormNovoProdutoProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [setupProdutos, setSetupProdutos] = useState<IProdutoSetup[]>([]);
  const [setupOldProdutos, setSetupOldProdutos] = useState<IProdutoSetup[]>([]);
  const [busca, setBuscaSetup] = useState<string>('');

  const adicionarSetup = async () => {
    try {
      setIsLoading(true);
      const setupNew = setupProdutos.map((p) => ({
        setup_id: p.id,
        product_id: p.id,
        setup_time: p.tempo_setup,
      }));
      const setupOld = setupOldProdutos.map((p) => ({
        setup_id: p.id,
        product_id: p.id,
        setup_time: p.tempo_setup,
      }));
      const dirtiedFields = setupNew.filter((p, index) => p.setup_time !== setupOld[index].setup_time).map(setup => ({
        id: setup.setup_id,
        setup_time: setup.setup_time
      }));

      const payload = {
        updates: dirtiedFields
      };

      if(payload.updates.length > 0) {
        await apiClient.put("/setup_trocas/batch", payload);
      }
      onClose(null);
    } catch (error) {
      console.log(error);
      toast.error("Erro ao criar o setup.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const { data } = await apiClient.get<ResponseOfProductsSetups[]>(
          `/setup_trocas/produto/${produto_ref}/resumo`
        );
        if (data.length === 0) {
          setSetupProdutos([]);
        } else {
          const products = data
            .filter((p) => p.pair_product.id !== produto_ref)
            .map((p) => ({
              nomeProdutoDestino: p.pair_product.name,
              tempo_setup: p.setup_time,
              id: p.pair_product.id,
            }));
          setSetupProdutos(products);
          setSetupOldProdutos(products);
        }
      } catch (error) {
        console.log(error);
        setSetupProdutos([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    getProducts();
  }, []);

  return (
    <div className="w-full flex flex-col gap-10 my-6 overflow-y-auto max-h-[95%]">
       <div className="relative max-w-md mt-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchSharp className="h-4 w-4 text-gray-400" />
            </div>
            <input
              value={''}
              onChange={(e) => setBuscaSetup(e.target.value)}
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
      {isLoadingProducts ? (
        <div className="w-full h-full flex justify-center items-center">
          <VscLoading size={20} className="animate-spin" />
        </div>
      ) : (
        setupProdutos.filter(p => p.nomeProdutoDestino.toLowerCase().includes(busca.toLowerCase())).map((produto) => (
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
                const index = setupProdutos.findIndex(
                  (p) => p.id === produto.id
                );
                setSetupProdutos((prev) => {
                  const oldProducts = [...prev];
                  oldProducts[index] = {
                    ...produto,
                    tempo_setup: Number(e.target.value),
                  };
                  return oldProducts;
                });
              }}
            />
          </div>
        ))
      )}
      <div className="w-full flex justify-end">
        <Button
          disable={isLoading || isLoadingProducts}
          isLoading={isLoading}
          onClick={adicionarSetup}
          title="Ok"
          type="button"
        />
      </div>
    </div>
  );
}

export default FormSetup;
