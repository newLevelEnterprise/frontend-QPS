import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";
import FormVincularComponente, {
  type VinculoModo,
} from "./formVincularComponente";

export interface IComponenteSemMolde {
  id: number;
  external_id?: string | null;
  name: string;
  used_in: { id: number; name: string }[];
}

function externalIdLabel(externalId?: string | null) {
  const value = (externalId ?? "").trim();
  return value || "—";
}

function relatedProductLabel(component: IComponenteSemMolde) {
  const names = component.used_in
    .map((product) => product.name.trim())
    .filter(Boolean);
  if (names.length === 0) return "Produto simples";
  return names.join(", ");
}

function counterLabel(count: number) {
  return count === 1
    ? "1 componente sem molde"
    : `${count} componentes sem molde`;
}

const WITHOUT_MOLD_KEY = ["get", "products", "without-mold"] as const;

function ComponentesSemMolde() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [vinculo, setVinculo] = useState<{
    component: IComponenteSemMolde;
    mode: VinculoModo;
  } | null>(null);

  const { data: components, isLoading } = useQuery({
    queryKey: WITHOUT_MOLD_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<IComponenteSemMolde[]>(
        "/products/without-mold",
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          params: { _: Date.now() },
        },
      );
      return data;
    },
  });

  const visible = useMemo(() => {
    const term = busca.trim().toLowerCase();
    const rows = components ?? [];
    if (!term) return rows;
    return rows.filter((component) => {
      const externalId = (component.external_id ?? "").toLowerCase();
      return (
        component.name.toLowerCase().includes(term) ||
        externalId.includes(term)
      );
    });
  }, [busca, components]);

  const closeVinculo = () => setVinculo(null);

  const refreshLists = (removedId?: number) => {
    if (removedId != null) {
      queryClient.setQueryData<IComponenteSemMolde[]>(
        WITHOUT_MOLD_KEY,
        (current) => current?.filter((item) => item.id !== removedId) ?? [],
      );
    }
    void queryClient.refetchQueries({ queryKey: ["get", "all", "moldes"] });
    void queryClient.refetchQueries({ queryKey: WITHOUT_MOLD_KEY });
  };

  return (
    <section className="mt-8">
      <h2 className="text-xl text-[#5B85D5] font-bold">Componentes sem molde</h2>
      <p className="mt-1 text-xs text-gray-500">
        Componentes cadastrados que ainda não possuem molde vinculado.
      </p>

      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
          <div className="relative w-full max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <IoSearchSharp className="h-4 w-4 text-gray-400" />
            </div>
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              type="text"
              placeholder="Buscar componente..."
              className="w-full rounded-full border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="ml-auto text-xs text-gray-500">
            {isLoading ? "Carregando..." : counterLabel(visible.length)}
          </span>
        </div>

        {isLoading ? (
          <Loader message="Carregando componentes sem molde" />
        ) : visible.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            Nenhum componente sem molde encontrado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 md:text-sm">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 md:text-sm">
                    Componente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 md:text-sm">
                    Produto relacionado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 md:text-sm">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((component) => {
                  const related = relatedProductLabel(component);
                  return (
                    <tr
                      key={component.id}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      <td
                        className="px-6 py-4 text-xs text-gray-900 md:text-sm"
                        title={externalIdLabel(component.external_id)}
                      >
                        {externalIdLabel(component.external_id)}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 md:text-sm">
                        {component.name}
                      </td>
                      <td
                        className="px-6 py-4 text-xs text-gray-900 md:text-sm"
                        title={related}
                      >
                        {related}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setVinculo({ component, mode: "existing" })
                            }
                            className="cursor-pointer rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 md:text-sm"
                          >
                            Adicionar a um molde
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal.Root isVisible={vinculo !== null}>
        <Modal.Container className="w-[min(560px,95vw)]">
          <Modal.Header title="Vincular componente" onClose={closeVinculo} />
          {vinculo && (
            <FormVincularComponente
              key={`${vinculo.component.id}-${vinculo.mode}`}
              component={vinculo.component}
              initialMode={vinculo.mode}
              onClose={closeVinculo}
              onSaved={() => {
                refreshLists(vinculo.component.id);
                closeVinculo();
              }}
            />
          )}
        </Modal.Container>
      </Modal.Root>
    </section>
  );
}

export default ComponentesSemMolde;
