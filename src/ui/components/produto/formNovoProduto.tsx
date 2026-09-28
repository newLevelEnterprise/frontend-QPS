import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import type { ICriarProdutoBody } from "../../../schemas/produto";
import type { IProduto } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import ProductCadastroForm from "./ProductCadastroForm";
import { toProductStructurePayload } from "./ProductStructureFields";

interface FormNovoProdutoProps {
  setNovoProduto: Dispatch<SetStateAction<boolean>>;
  setProducts: () => void;
}

function FormNovoProduto({
  setNovoProduto,
  setProducts,
}: FormNovoProdutoProps) {
  const { data: products = [] } = useQuery({
    queryKey: ["get", "all", "products"],
    queryFn: async () => {
      const { data } = await apiClient.get<IProduto[]>("/products/");
      return data;
    },
  });

  const onSave = async (data: ICriarProdutoBody) => {
    try {
      await apiClient.post("/products", {
        external_id: data.external_id.trim() || null,
        name: data.name,
        post_injection_cycle_time: Number.parseInt(
          data.post_injection_cycle_time,
          10,
        ),
        components: toProductStructurePayload(data),
      });
      setProducts();
      toast.success("Produto criado com sucesso!");
      setNovoProduto(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        const detail = error.response?.data?.detail;
        toast.error(
          typeof detail === "string"
            ? detail
            : "Erro ao criar produto. Tente novamente.",
        );
        return;
      }
      toast.error("Erro ao criar produto. Tente novamente.");
    }
  };

  return (
    <ProductCadastroForm
      idPrefix="novo-produto"
      products={products}
      defaultValues={{
        external_id: "",
        name: "",
        post_injection_cycle_time: "0",
        structureType: "simple",
        components: [],
      }}
      onCancel={() => setNovoProduto(false)}
      onSave={onSave}
    />
  );
}

export default FormNovoProduto;
