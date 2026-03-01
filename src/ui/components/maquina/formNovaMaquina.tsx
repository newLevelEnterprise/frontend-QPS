import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  criarLinhasProdSchema,
  type ICriarLinhasProdBody,
} from "../../../schemas/linhas";
import type { IMaquinasType } from "../../../types/Maquina";
import type { IMoldes } from "../../../types/Moldes";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormNovaMaquinaProps {
  setNovaMaquina: Dispatch<SetStateAction<boolean>>;
  setMaquina: () => void;
  linhaId?: string;
}

function FormNovaMaquina({
  setNovaMaquina,
  setMaquina,
  linhaId,
}: IFormNovaMaquinaProps) {
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
      maquinas: [{ machineId: "", tempoCiclo: "" }],
    },
  });
  console.log(linhaId);
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

  const moldeSelecionado = useMemo(
    () => moldes?.find((molde) => String(molde.id) === moldeSelecionadoId),
    [moldes, moldeSelecionadoId],
  );

  useEffect(() => {
    setValue("produto", "");
  }, [moldeSelecionadoId, setValue]);

  const onSubmit = async (data: ICriarLinhasProdBody) => {
    try {
      for (const maquina of data.maquinas) {
        await apiClient.post("/production-time", {
          tempo_ciclo: parseFloat(maquina.tempoCiclo),
          machine_id: parseInt(maquina.machineId),
          product_id: parseInt(data.produto),
          mold_id: parseInt(data.codMolde),
        });
      }

      await apiClient.post("/composition-lines", {
        production_line_id: parseInt(linhaId || "0"),
        mold_id: parseInt(data.codMolde),
        product_id: parseInt(data.produto),
        post_injection_cycle_time: parseFloat(data.tempoPosInjecao),
        machines: data.maquinas.map((m) => parseInt(m.machineId)),
      });

      console.log("Dados do formulário:", data);
      toast.success("Máquinas criadas com sucesso!");
      setMaquina();
      setNovaMaquina(false);
    } catch (error) {
      console.error("Erro ao criar máquina:", error);
      toast.error("Erro ao criar máquina. Tente novamente.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-10 my-6"
    >
      <div className="w-full flex flex-col gap-3">
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
            defaultValue=""
          >
            <option value="" disabled>
              {isFetchingMoldes ? "Carregando moldes..." : "Selecione um molde"}
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
      </div>

      {moldeSelecionado && (
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
              defaultValue=""
            >
              <option value="" disabled>
                Selecione um produto
              </option>
              {moldeSelecionado.products.map((produto) => (
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

      <div className="w-full flex flex-col gap-3">
        <label
          htmlFor="tempoPosInjecao"
          className="text-[#212A4F] font-semibold truncate text-ellipsis"
        >
          Tempo pós injeção (s)
        </label>
        <div className="flex gap-1">
          <input
            id="tempoPosInjecao"
            placeholder="Tempo pós injeção"
            type="number"
            min="0"
            step="0.01"
            className="w-full outline-none border-b border-[#A4AABC]"
            {...register("tempoPosInjecao")}
          />
        </div>
        {errors.tempoPosInjecao && (
          <ErrorMessage
            errors={errors}
            name="tempoPosInjecao"
            render={({ message }) => <FormErrorMessage message={message} />}
          />
        )}
      </div>

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
                defaultValue=""
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

export default FormNovaMaquina;
