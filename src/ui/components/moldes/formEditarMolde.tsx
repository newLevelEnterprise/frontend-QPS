import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { toast } from "react-toastify";
import { hideMoldFields } from "../../../config/featureFlags";
import {
  criarmoldesSchema,
  type ICriarMoldesBody,
} from "../../../schemas/moldes";
import type { IMoldes } from "../../../types/Moldes";
import type { IProduto } from "../../../types/Produto";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormEditarMoldeProps {
  molde: IMoldes;
  setEditarMolde: Dispatch<SetStateAction<boolean>>;
  setMolde: () => void;
}

function FormEditarMolde({
  setEditarMolde,
  setMolde,
  molde,
}: IFormEditarMoldeProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarMoldesBody>({
    resolver: zodResolver(criarmoldesSchema),
    defaultValues: {
      name: molde.name,
      products: molde.products.map((prod) => prod.id) || [],
      total_cavities: molde.total_cavities ? String(molde.total_cavities) : "",
      open_cavities: molde.open_cavities ? String(molde.open_cavities) : "",
      scrap: molde.scrap ? String(molde.scrap) : "",
      closed_cavity_risk: molde.closed_cavity_risk
        ? String(molde.closed_cavity_risk)
        : "",
    },
  });

  const { data: products, isFetching } = useQuery({
    queryKey: ["get", "all", "products"],
    queryFn: async () => {
      const { data } = await apiClient.get<IProduto[]>("/products/");
      return data.filter((product) => product.is_simple !== false);
    },
  });

  const onSubmit = async (data: ICriarMoldesBody) => {
    try {
      const fabricableIds = new Set((products ?? []).map((product) => product.id));
      await apiClient.put<IMoldes>(`/molds/${molde.id}`, {
        name: data.name,
        products: data.products.filter((productId) => fabricableIds.has(productId)),
        total_cavities: Number(data.total_cavities),
        open_cavities: Number(data.open_cavities),
        scrap: parseFloat(data.scrap),
        closed_cavity_risk: parseFloat(data.closed_cavity_risk),
      });
      setMolde();
      toast.success("Molde atualizado com sucesso!");
      setEditarMolde(false);
    } catch (error) {
      console.error("Erro ao atualizar molde:", error);
      toast.error("Erro ao atualizar molde. Tente novamente.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-10 my-6"
    >
      <div className="flex flex-col gap-4">
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="nome"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            Nome
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="nome"
              placeholder="Nome do molde"
              type="text"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <ErrorMessage
              errors={errors}
              name="name"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>

        <div className="flex gap-6">
          <div className="w-full flex flex-col gap-3">
            <label
              htmlFor="totalCavidades"
              className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
            >
              Produto
            </label>
            <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
              <Controller
                name="products"
                control={control}
                render={({ field }) => (
                  <Select
                    options={
                      products?.map((product) => ({
                        value: product.id,
                        label: product.name,
                      })) || []
                    }
                    isLoading={isFetching}
                    placeholder="Selecione os produtos"
                    onChange={(value) =>
                      field.onChange(value.map((v) => v?.value).filter(Boolean))
                    }
                    defaultValue={molde.products
                      .map((prodId) => {
                        const prod = products?.find((p) => p.id === prodId.id);
                        return prod
                          ? { value: prod.id, label: prod.name }
                          : null;
                      })
                      .filter(Boolean)}
                    isMulti
                  />
                )}
              />
            </div>
            {errors.products && (
              <ErrorMessage
                errors={errors}
                name="products"
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            )}
          </div>
          {!hideMoldFields && (
            <div className="w-full flex flex-col gap-3">
              <label
                htmlFor="totalCavidades"
                className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
              >
                Total Cavidades
              </label>
              <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
                <input
                  id="totalCavidades"
                  placeholder="Total de Cavidades"
                  type="number"
                  className="w-full outline-none border-b border-[#A4AABC]"
                  {...register("total_cavities")}
                />
              </div>
              {errors.total_cavities && (
                <ErrorMessage
                  errors={errors}
                  name="total_cavities"
                  render={({ message }) => <FormErrorMessage message={message} />}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {!hideMoldFields && (
            <div className="w-full flex flex-col gap-3">
              <label
                htmlFor="cavidadesAbertas"
                className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
              >
                Cavidades Abertas
              </label>
              <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
                <input
                  id="cavidadesAbertas"
                  placeholder="Cavidades Abertas"
                  type="number"
                  className="w-full outline-none border-b border-[#A4AABC]"
                  {...register("open_cavities")}
                />
              </div>
              {errors.open_cavities && (
                <ErrorMessage
                  errors={errors}
                  name="open_cavities"
                  render={({ message }) => <FormErrorMessage message={message} />}
                />
              )}
            </div>
          )}
          <div className="w-full flex flex-col gap-3">
            <label
              htmlFor="refugo"
              className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
            >
              % Refugo
            </label>
            <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
              <input
                id="refugo"
                placeholder="Refugo"
                type="number"
                step={0.01}
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("scrap")}
              />
            </div>
            {errors.scrap && (
              <ErrorMessage
                errors={errors}
                name="scrap"
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            )}
          </div>
        </div>

        {hideMoldFields ? (
          <>
            <input type="hidden" {...register("total_cavities")} />
            <input type="hidden" {...register("open_cavities")} />
            <input type="hidden" {...register("closed_cavity_risk")} />
          </>
        ) : (
          <div className="w-full flex flex-col gap-3">
            <label
              htmlFor="riscoDeCavidade"
              className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
            >
              % Risco de Cavidade
            </label>
            <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
              <input
                id="cavityRisk"
                placeholder="Risco de Cavidade"
                type="number"
                step={0.01}
                className="w-full outline-none border-b border-[#A4AABC]"
                {...register("closed_cavity_risk")}
              />
            </div>
            {errors.closed_cavity_risk && (
              <ErrorMessage
                errors={errors}
                name="closed_cavity_risk"
                render={({ message }) => <FormErrorMessage message={message} />}
              />
            )}
          </div>
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

export default FormEditarMolde;
