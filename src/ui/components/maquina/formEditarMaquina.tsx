import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  criarLinhasProdSchema,
  type ICriarLinhasProdBody,
} from "../../../schemas/linhas";
import { hideMoldFields } from "../../../config/featureFlags";
import type { IMaquinas, IMaquinasType } from "../../../types/Maquina";
import type { IMoldes } from "../../../types/Moldes";
import { apiClient } from "../../../utils/apiClient";
import {
  findMoldForProduct,
  uniqueProductsFromMolds,
} from "../../../utils/moldResolution";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

type IMaquinaEdicao = IMaquinas & {
  linhaId?: string | number;
  mold_id?: number;
  product_id?: number;
  product_name?: string;
  machine_id?: number;
  cycle_time?: number | string;
  tempo_ciclo?: number | string;
  machines?: Array<{
    id?: number;
    machine_id?: number;
    cycle_time?: number | string;
    tempo_ciclo?: number | string;
  }>;
};

interface IFormEditarMaquinaProps {
  maquina: IMaquinaEdicao;
  setEditarMaquina: Dispatch<SetStateAction<boolean>>;
  setMaquina: () => void;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    const data = responseData as {
      message?: string;
      error?: string;
      detail?: string;
    };

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }

    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
  }

  return fallback;
}

function FormEditarMaquina({
  maquina,
  setEditarMaquina,
  setMaquina,
}: IFormEditarMaquinaProps) {
  const defaultCodMolde =
    maquina.mold_id != null
      ? String(maquina.mold_id)
      : String(maquina.codMolde || "");

  const defaultProduto =
    maquina.product_id != null
      ? String(maquina.product_id)
      : String(maquina.produto || "").trim() === "undefined"
        ? ""
        : String(maquina.produto || "");

  const defaultMaquinas =
    maquina.machines && maquina.machines.length > 0
      ? maquina.machines.map((m) => ({
          machineId: String(m.machine_id ?? m.id ?? ""),
          tempoCiclo: String(m.tempo_ciclo ?? m.cycle_time ?? ""),
        }))
      : [
          {
            machineId: String(maquina.machine_id ?? maquina.id ?? ""),
            tempoCiclo: String(maquina.tempo_ciclo ?? maquina.cycle_time ?? ""),
          },
        ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarLinhasProdBody>({
    resolver: zodResolver(criarLinhasProdSchema),
    defaultValues: {
      codMolde: defaultCodMolde,
      produto: defaultProduto,
      maquinas: defaultMaquinas,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "maquinas",
  });

  const { data: moldes, isFetching: isFetchingMoldes } = useQuery({
    queryKey: ["get", "all", "moldes"],
    queryFn: async () => {
      const { data } = await apiClient.get<IMoldes[]>("/molds/");
      return data;
    },
  });

  const { data: maquinasExistentes, isFetching: isFetchingMaquinas } = useQuery(
    {
      queryKey: ["get", "all", "machines"],
      queryFn: async () => {
        const { data } = await apiClient.get<IMaquinasType[]>("/machines/");
        return data;
      },
    },
  );

  const moldeSelecionadoId = watch("codMolde");
  const produtoSelecionado = watch("produto");
  const isFirstRender = useRef(true);

  const moldeSelecionado = useMemo(
    () => moldes?.find((molde) => String(molde.id) === moldeSelecionadoId),
    [moldes, moldeSelecionadoId],
  );

  const produtosDisponiveis = useMemo(
    () =>
      hideMoldFields
        ? uniqueProductsFromMolds(moldes)
        : moldeSelecionado?.products ?? [],
    [moldes, moldeSelecionado],
  );

  useEffect(() => {
    if (hideMoldFields) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setValue("produto", "");
  }, [moldeSelecionadoId, setValue]);

  useEffect(() => {
    if (!hideMoldFields) return;
    const molde = findMoldForProduct(moldes, String(produtoSelecionado || ""));
    if (molde) {
      setValue("codMolde", String(molde.id), { shouldValidate: true });
    }
  }, [moldes, produtoSelecionado, setValue]);

  useEffect(() => {
    if (!moldeSelecionado) return;

    const valorProduto = String(produtoSelecionado || "").trim();
    const ehIdNumerico = /^\d+$/.test(valorProduto);
    if (ehIdNumerico) return;

    const nomeProduto = String(
      maquina.product_name || maquina.produto || "",
    ).trim();
    if (!nomeProduto) return;

    const produtoPorNome = moldeSelecionado.products.find(
      (produto) => produto.name === nomeProduto,
    );

    if (produtoPorNome) {
      setValue("produto", String(produtoPorNome.id), {
        shouldValidate: true,
      });
    }
  }, [
    maquina.product_name,
    maquina.produto,
    moldeSelecionado,
    produtoSelecionado,
    setValue,
  ]);

  const onSubmit = async (data: ICriarLinhasProdBody) => {
    try {
      const moldId = parseInt(data.codMolde, 10);
      const productId = parseInt(data.produto, 10);

      if (Number.isNaN(moldId) || Number.isNaN(productId)) {
        toast.error("Selecione molde e produto válidos para salvar.");
        return;
      }

      for (const item of data.maquinas) {
        try {
          await apiClient.post("/production-time", {
            tempo_ciclo: parseFloat(item.tempoCiclo),
            machine_id: parseInt(item.machineId),
            product_id: productId,
            mold_id: moldId,
          });
        } catch (error) {
          const errorMessage = getApiErrorMessage(
            error,
            `Erro ao salvar tempo de ciclo da máquina ${item.machineId}.`,
          );
          toast.error(errorMessage);
          return;
        }
      }

      const payload = {
        mold_id: moldId,
        product_id: productId,
        machines: data.maquinas.map((m) => parseInt(m.machineId)),
      };

      if (maquina.id) {
        try {
          await apiClient.put(`/composition-lines/${maquina.id}`, payload);
        } catch (error) {
          toast.error(
            getApiErrorMessage(
              error,
              "Erro ao atualizar a linha de composição.",
            ),
          );
          return;
        }
      } else {
        try {
          await apiClient.post("/composition-lines", {
            production_line_id: Number(maquina.linhaId || 0),
            ...payload,
          });
        } catch (error) {
          toast.error(
            getApiErrorMessage(error, "Erro ao criar a linha de composição."),
          );
          return;
        }
      }

      toast.success("Máquina atualizada com sucesso!");
      setMaquina();
      setEditarMaquina(false);
    } catch (error) {
      console.error("Erro ao atualizar máquina:", error);
      toast.error(
        getApiErrorMessage(
          error,
          "Erro ao atualizar máquina. Tente novamente.",
        ),
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-10 my-6"
    >
      <div className="w-full flex flex-col gap-3">
        {!hideMoldFields ? (
          <>
            <label
              htmlFor="codMolde"
              className="text-[#212A4F] font-semibold truncate text-ellipsis"
            >
              Molde
            </label>
            <div className="flex gap-1">
              <select
                id="codMolde"
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("codMolde")}
                disabled={isFetchingMoldes}
              >
                <option value="" disabled>
                  {isFetchingMoldes
                    ? "Carregando moldes..."
                    : "Selecione um molde"}
                </option>
                {moldes?.map((molde) => (
                  <option key={molde.id} value={String(molde.id)}>
                    {molde.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.codMolde && (
              <ErrorMessage
                errors={errors}
                name="codMolde"
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            )}
          </>
        ) : (
          <input type="hidden" {...register("codMolde")} />
        )}
      </div>

      {(hideMoldFields || moldeSelecionado) && (
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="produto"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Produtos
          </label>
          <div className="flex gap-1">
            <select
              id="produto"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("produto")}
            >
              <option value="" disabled>
                Selecione um produto
              </option>
              {produtosDisponiveis.map((produto) => (
                <option key={produto.id} value={String(produto.id)}>
                  {produto.name}
                </option>
              ))}
            </select>
          </div>
          {errors.produto && (
            <ErrorMessage
              errors={errors}
              name="produto"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
      )}

      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex items-center justify-between">
          <label className="text-[#212A4F] font-semibold truncate text-ellipsis">
            Máquinas
          </label>
          <button
            type="button"
            onClick={() => append({ machineId: "", tempoCiclo: "" })}
            className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            + Adicionar máquina
          </button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="w-full flex gap-4 items-start">
            <div className="w-full flex flex-col gap-2">
              <label
                htmlFor={`maquina-id-${field.id}`}
                className="text-[#212A4F] font-semibold truncate text-ellipsis"
              >
                Máquina
              </label>
              <select
                id={`maquina-id-${field.id}`}
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register(`maquinas.${index}.machineId`)}
                disabled={isFetchingMaquinas}
              >
                <option value="" disabled>
                  {isFetchingMaquinas
                    ? "Carregando máquinas..."
                    : "Selecione uma máquina"}
                </option>
                {maquinasExistentes?.map((machine) => (
                  <option key={machine.id} value={String(machine.id)}>
                    {machine.name}
                  </option>
                ))}
              </select>
              <ErrorMessage
                errors={errors}
                name={`maquinas.${index}.machineId`}
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <label
                htmlFor={`maquina-ciclo-${field.id}`}
                className="text-[#212A4F] font-semibold truncate text-ellipsis"
              >
                Tempo de ciclo (s)
              </label>
              <input
                id={`maquina-ciclo-${field.id}`}
                placeholder="Tempo de ciclo"
                type="number"
                min="0"
                step="0.01"
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register(`maquinas.${index}.tempoCiclo`)}
              />
              <ErrorMessage
                errors={errors}
                name={`maquinas.${index}.tempoCiclo`}
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              className="mt-8 text-sm text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer"
            >
              Remover
            </button>
          </div>
        ))}

        {errors.maquinas?.message && (
          <FormErrorMessage message={errors.maquinas.message} />
        )}
      </div>

      <div className="w-full flex justify-end">
        <Button
          title="Ok"
          disable={isSubmitting || !isValid}
          isLoading={isSubmitting}
          type="submit"
        />
      </div>
    </form>
  );
}

export default FormEditarMaquina;
