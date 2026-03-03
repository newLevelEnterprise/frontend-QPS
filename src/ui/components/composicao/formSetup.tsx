import { type Dispatch, useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { VscLoading } from "react-icons/vsc";
import { toast } from "react-toastify";
import type { IProdutoSetup } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";

export interface ResponseOfProductsSetups {
  id: number;
  production_line_id: number;
  from_composition_line_id: number;
  to_composition_line_id: number;
  name: string;
  setup_time: number;
  from_product: {
    id: number;
    name: string;
  };
  from_mold: {
    id: number;
    name: string;
  };
  to_product: {
    id: number;
    name: string;
  };
  to_mold: {
    id: number;
    name: string;
  };
}

interface FormNovoProdutoProps {
  composition_line_ref: number;
  onClose: Dispatch<
    React.SetStateAction<{
      nome: string;
      id: number;
    } | null>
  >;
}

function FormSetup({ composition_line_ref, onClose }: FormNovoProdutoProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [setupProdutos, setSetupProdutos] = useState<IProdutoSetup[]>([]);
  const [setupOldProdutos, setSetupOldProdutos] = useState<IProdutoSetup[]>([]);
  const [busca, setBuscaSetup] = useState<string>("");

  const adicionarSetup = async () => {
    try {
      setIsLoading(true);
      const oldBySetupId = new Map(
        setupOldProdutos.map((item) => [item.setup_id, item.tempo_setup]),
      );

      const dirtiedFields = setupProdutos
        .filter((item) => oldBySetupId.get(item.setup_id) !== item.tempo_setup)
        .map((item) => ({
          id: item.setup_id,
          setup_time: item.tempo_setup,
        }));

      const payload = {
        updates: dirtiedFields,
      };

      if (payload.updates.length > 0) {
        await apiClient.put("/setups/batch", payload);
        toast.success("Setup atualizado");
      }
      onClose(null);
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar o setup.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const { data } = await apiClient.get<ResponseOfProductsSetups[]>(
          `/setups/composition-line/${composition_line_ref}/resumo`,
        );
        if (data.length === 0) {
          setSetupProdutos([]);
          setSetupOldProdutos([]);
        } else {
          const products = data
            .filter(
              (item) =>
                item.from_product.id === composition_line_ref ||
                item.to_product.id === composition_line_ref,
            )
            .map((item) => {
              const produtoDestino =
                item.from_product.id === composition_line_ref
                  ? item.to_product
                  : item.from_product;

              return {
                nomeProdutoDestino: produtoDestino.name,
                tempo_setup: item.setup_time,
                id: produtoDestino.id,
                setup_id: item.id,
              };
            });

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
  }, [composition_line_ref]);

  return (
    <div className="w-full flex flex-col gap-10 my-6 overflow-y-auto max-h-[95%]">
      <div className="relative max-w-md mt-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IoSearchSharp className="h-4 w-4 text-gray-400" />
        </div>
        <input
          value={busca}
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
        setupProdutos
          .filter((p) =>
            p.nomeProdutoDestino.toLowerCase().includes(busca.toLowerCase()),
          )
          .map((produto) => (
            <div
              key={produto.setup_id}
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
                    (p) => p.setup_id === produto.setup_id,
                  );
                  setSetupProdutos((prev) => {
                    const oldProducts = [...prev];
                    oldProducts[index] = {
                      ...produto,
                      tempo_setup:
                        Number(e.target.value) > 0 ? Number(e.target.value) : 0,
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
