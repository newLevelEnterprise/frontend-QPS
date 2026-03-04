import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  criarParadaSchema,
  type ICriarParadaBody,
} from "../../../../schemas/paradas";
import type { IMaquinasType } from "../../../../types/Maquina";
import type { IParadas } from "../../../../types/Paradas";
import { apiClient } from "../../../../utils/apiClient";
import Button from "../../Button";
import FormErrorMessage from "../../forms/FormErrorMessage";

interface FormEditarParadaProps {
  setEditarParada: Dispatch<SetStateAction<boolean>>;
  parada: IParadas;
  onEditarParada: (paradaAtualizada: IParadas) => void;
}

function FormEditarParada({
  setEditarParada,
  parada,
  onEditarParada,
}: FormEditarParadaProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarParadaBody>({
    resolver: zodResolver(criarParadaSchema),
    defaultValues: {
      motivo: parada.motivo,
      product_line_id: parada.product_line_id.toString(),
      dataInicio: parada.dataInicio,
      horaInicio: parada.horaInicio,
      dataFim: parada.dataFim,
      horaFim: parada.horaFim,
      maquina: parada.maquina,
    },
  });

  const { data: compositionLines, isFetching: isFetchingCompositionLines } =
    useQuery({
      queryKey: ["get", "all", "compositionLines"],
      queryFn: async () => {
        const { data } = await apiClient.get<
          { machines: { id: number }[]; production_line_id: number }[]
        >("/composition-lines/");
        return data;
      },
    });
  const { data: maquinas, isFetching: isFetchingMaquinas } = useQuery({
    queryKey: ["get", "all", "machines"],
    queryFn: async () => {
      const { data } = await apiClient.get<IMaquinasType[]>("/machines/");
      return data;
    },
  });

  const onSubmit = (data: ICriarParadaBody) => {
    const productLineId = compositionLines?.find((line) =>
      line.machines.some((machine) => machine.id === Number(data.maquina)),
    )?.production_line_id;

    if (!productLineId) {
      toast.error(
        "Não foi possível identificar a linha de produção para a máquina selecionada.",
      );
      return;
    }

    onEditarParada({
      id: parada.id,
      product_line_id: productLineId,
      motivo: data.motivo,
      dataInicio: data.dataInicio,
      horaInicio: data.horaInicio,
      dataFim: data.dataFim,
      horaFim: data.horaFim,
      maquina: data.maquina,
    });

    setEditarParada(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-10 my-6"
    >
      <div className="w-full flex flex-col gap-3">
        <label
          htmlFor="nome"
          className="text-[#212A4F] font-semibold truncate text-ellipsis"
        >
          Motivo
        </label>
        <div className="flex gap-1">
          <input
            id="nome"
            placeholder="Nome da máquina"
            type="text"
            className="w-full outline-none border-b border-[#A4AABC]"
            {...register("motivo")}
          />
        </div>
        {errors.motivo && (
          <ErrorMessage
            errors={errors}
            name="motivo"
            render={({ message }) => <FormErrorMessage message={message} />}
          />
        )}
      </div>

      <div className="w-full flex justify-between gap-4">
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="dataInicioParada"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Data Inicio da Parada
          </label>
          <div className="flex gap-1">
            <input
              id="dataInicioParada"
              placeholder="Data Inicio da Parada"
              type="date"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("dataInicio")}
            />
          </div>
          {errors.dataInicio && (
            <ErrorMessage
              errors={errors}
              name="dataInicio"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="horarioInicioParada"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Horário Inicio da Parada
          </label>
          <div className="flex gap-1">
            <input
              id="horarioInicioParada"
              placeholder="Horário Inicio da Parada"
              type="time"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("horaInicio")}
            />
          </div>
          {errors.horaInicio && (
            <ErrorMessage
              errors={errors}
              name="horaInicio"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
      </div>

      <div className="w-full flex justify-between gap-4">
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="dataFimParada"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Data fim da Parada
          </label>
          <div className="flex gap-1">
            <input
              id="dataFimParada"
              placeholder="Data Fim da Parada"
              type="date"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("dataFim")}
            />
          </div>
          {errors.dataFim && (
            <ErrorMessage
              errors={errors}
              name="dataFim"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="horarioFimParada"
            className="text-[#212A4F] font-semibold truncate text-ellipsis"
          >
            Horário Fim da Parada
          </label>
          <div className="flex gap-1">
            <input
              id="horarioFimParada"
              placeholder="Horário Fim da Parada"
              type="time"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("horaFim")}
            />
          </div>
          {errors.horaFim && (
            <ErrorMessage
              errors={errors}
              name="horaFim"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        <label
          htmlFor="maquina"
          className="text-[#212A4F] font-semibold truncate text-ellipsis"
        >
          Máquina
        </label>
        <div className="flex gap-1">
          <select
            disabled={isFetchingCompositionLines || isFetchingMaquinas}
            id="maquina"
            className="w-full outline-none border-b border-[#A4AABC] bg-white"
            {...register("maquina")}
          >
            {maquinas?.map((maquina) => (
              <option key={maquina.id} value={maquina.id}>
                {maquina.name}
              </option>
            ))}
          </select>
        </div>
        {errors.maquina && (
          <ErrorMessage
            errors={errors}
            name="maquina"
            render={({ message }) => <FormErrorMessage message={message} />}
          />
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

export default FormEditarParada;
