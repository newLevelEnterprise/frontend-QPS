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
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormNovoMoldeProps {
  setNovoMolde: Dispatch<SetStateAction<boolean>>;
  setMolde: () => void;
}

function FormNovoMolde({ setNovoMolde, setMolde }: IFormNovoMoldeProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarMoldesBody>({
    resolver: zodResolver(criarmoldesSchema),
    defaultValues: hideMoldFields
      ? {
          total_cavities: "1",
          open_cavities: "1",
          closed_cavity_risk: "0",
        }
      : undefined,
  });

  const { data: products, isFetching } = useQuery({
    queryKey: ["get", "all", "products"],
    queryFn: async () => {
      const { data } =
        await apiClient.get<{ id: number; name: string }[]>("/products/");
      return data;
    },
  });

  const onSubmit = async (data: ICriarMoldesBody) => {
    try {
      const { data: res } = await apiClient.post<IMoldes>("/molds", {
        name: data.name,
        products: data.products,
        total_cavities: Number(data.total_cavities),
        open_cavities: Number(data.open_cavities),
        scrap: parseFloat(data.scrap),
        closed_cavity_risk: parseFloat(data.closed_cavity_risk),
      });
      toast.success("Molde criado com sucesso!");
      setMolde();
      setNovoMolde(false);
      console.log(res);
    } catch (error) {
      console.error("Erro ao criar molde:", error);
      toast.error("Erro ao criar molde. Tente novamente.");
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
                <div className="w-full">
                  <Select
                    options={
                      products?.map((product) => ({
                        value: product.id,
                        label: product.name,
                      })) || []
                    }
                    isLoading={isFetching}
                    placeholder="Selecione os produtos"
                    onChange={(value) => {
                      field.onChange(value.map((v) => v.value));
                    }}
                    isMulti
                  />
                </div>
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
        {hideMoldFields ? (
          <>
            <input type="hidden" {...register("closed_cavity_risk")} />
            <input type="hidden" {...register("total_cavities")} />
            <input type="hidden" {...register("open_cavities")} />
          </>
        ) : (
          <>
            <div className="flex gap-6">
              <div className="w-full flex flex-col gap-3">
                <label
                  htmlFor="closedCavityRisk"
                  className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
                >
                  % Risco de Cavidade
                </label>
                <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
                  <input
                    id="closedCavityRisk"
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
                    render={({ message }) => (
                      <FormErrorMessage message={message} />
                    )}
                  />
                )}
              </div>
              <div className="w-full flex flex-col gap-3">
                <label
                  htmlFor="totalCavidades"
                  className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
                >
                  Total de Cavidades
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
                    render={({ message }) => (
                      <FormErrorMessage message={message} />
                    )}
                  />
                )}
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-full flex flex-col gap-3">
                <label
                  htmlFor="cavidadesAbertas"
                  className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
                >
                  Cavidades Abertas
                </label>
                <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
                  <input
                    id="openCavities"
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
                    render={({ message }) => (
                      <FormErrorMessage message={message} />
                    )}
                  />
                )}
              </div>
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
                    render={({ message }) => (
                      <FormErrorMessage message={message} />
                    )}
                  />
                )}
              </div>
            </div>
          </>
        )}
        {hideMoldFields && (
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

export default FormNovoMolde;
