import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import type { ICriarProdutoBody } from "../../../schemas/produto";
import type { IProduto } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import ProductCadastroForm from "./ProductCadastroForm";
import { toProductStructurePayload } from "./ProductStructureFields";

interface FormEditarProdutoProps {
  produto: IProduto;
  setEditarProduto: Dispatch<SetStateAction<boolean>>;
  setProducts: () => void;
}

function isSimpleProduct(produto: IProduto) {
  return (
    produto.is_simple ??
    (!produto.structure_components?.length ||
      (produto.structure_components.length === 1 &&
        produto.structure_components[0].id === produto.id &&
        produto.structure_components[0].quantity === 1))
  );
}

function FormEditarProduto({
  produto,
  setEditarProduto,
  setProducts,
}: FormEditarProdutoProps) {
  const { data: products = [] } = useQuery({
    queryKey: ["get", "all", "products"],
    queryFn: async () => {
      const { data } = await apiClient.get<IProduto[]>("/products/");
      return data;
    },
  });

  const simple = isSimpleProduct(produto);
  const knownNames = Object.fromEntries(
    (produto.structure_components ?? []).map((component) => [
      String(component.id),
      component.name,
    ]),
  );

  const onSave = async (data: ICriarProdutoBody) => {
    try {
      await apiClient.put(`/products/${produto.id}`, {
        external_id: data.external_id.trim(),
        name: data.name,
        post_injection_cycle_time: Number.parseInt(
          data.post_injection_cycle_time,
          10,
        ),
        components: toProductStructurePayload(data),
      });
      setProducts();
      toast.success("Produto atualizado com sucesso!");
      setEditarProduto(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        const detail = error.response?.data?.detail;
        toast.error(
          typeof detail === "string"
            ? detail
            : "Erro ao editar produto. Tente novamente.",
        );
        return;
      }
      toast.error("Erro ao editar produto. Tente novamente.");
    }
  };

  return (
    <ProductCadastroForm
      idPrefix={`editar-produto-${produto.id}`}
      products={products}
      excludeProductId={produto.id}
      knownNames={knownNames}
      defaultValues={{
        external_id: produto.external_id ?? "",
        name: produto.name,
        post_injection_cycle_time: String(produto.post_injection_cycle_time ?? 0),
        structureType: simple ? "simple" : "compound",
        components: simple
          ? []
          :             (produto.structure_components ?? []).map((component) => ({
              component_product_id: String(component.id),
              name: "",
              external_id: component.external_id ?? "",
              quantity: String(component.quantity),
            })),
      }}
      onCancel={() => setEditarProduto(false)}
      onSave={onSave}
    />
  );
}

export default FormEditarProduto;
