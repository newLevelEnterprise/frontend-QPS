import { type Dispatch, useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { VscLoading } from "react-icons/vsc";
import { toast } from "react-toastify";
import type { IProdutoSetup } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";

export interface ResponseOfProductsSetups {
  id: number;
  name: string;
  setup_time: number;
  from_composition_line: {
    id: number;
    mold_name: string;
    product_name: string;
    name: string;
  };
  to_composition_line: {
    id: number;
    mold_name: string;
    product_name: string;
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
          `/setups/composition-line/2/resumo`,
        );
        if (data.length === 0) {
          setSetupProdutos([]);
          setSetupOldProdutos([]);
        } else {
          const products = data
            .filter(
              (item) =>
                item.from_composition_line.id === 2 ||
                item.to_composition_line.id === 2,
            )
            .map((item) => {
              const produtoDestino =
                item.from_composition_line.id === 2
                  ? item.to_composition_line
                  : item.from_composition_line;

              return {
                nomeProdutoDestino:
                  produtoDestino.name ||
                  `${produtoDestino.mold_name} ${produtoDestino.product_name}`,
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
    <div className="w-full flex flex-col gap-4 my-4 overflow-y-auto max-h-[95%]">
      <div className="relative w-full md:max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IoSearchSharp className="h-4 w-4 text-gray-400" />
        </div>
        <input
          value={busca}
          onChange={(e) => setBuscaSetup(e.target.value)}
          type="text"
          placeholder="Buscar produto destino..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {isLoadingProducts ? (
        <div className="w-full h-full flex justify-center items-center">
          <VscLoading size={20} className="animate-spin" />
        </div>
      ) : (
        <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200">
            <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide">
              Produto destino
            </p>
            <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide text-right">
              Tempo (min)
            </p>
          </div>

          <div className="max-h-[48vh] overflow-y-auto divide-y divide-gray-200">
            {setupProdutos.filter((p) =>
              p.nomeProdutoDestino.toLowerCase().includes(busca.toLowerCase()),
            ).length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-500">
                Nenhum setup encontrado.
              </p>
            ) : (
              setupProdutos
                .filter((p) =>
                  p.nomeProdutoDestino
                    .toLowerCase()
                    .includes(busca.toLowerCase()),
                )
                .map((produto) => (
                  <div
                    key={produto.setup_id}
                    className="grid grid-cols-[minmax(0,1fr)_130px] gap-3 items-center px-3 py-2"
                  >
                    <p className="text-sm text-gray-800 truncate">
                      {produto.nomeProdutoDestino}
                    </p>
                    <input
                      type="number"
                      min={0}
                      className="h-9 w-full px-2 text-right outline-none border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                              Number(e.target.value) > 0
                                ? Number(e.target.value)
                                : 0,
                          };
                          return oldProducts;
                        });
                      }}
                    />
                  </div>
                ))
            )}
          </div>
        </div>
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
