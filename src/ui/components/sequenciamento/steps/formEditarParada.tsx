import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  criarParadaSchema,
  type ICriarParadaBody,
} from "../../../../schemas/paradas";
import type { IParadas } from "../../../../types/Paradas";
import { apiClient } from "../../../../utils/apiClient";
import Button from "../../Button";
import FormErrorMessage from "../../forms/FormErrorMessage";

interface FormEditarParadaProps {
  setEditarParada: Dispatch<SetStateAction<boolean>>;
  parada: IParadas;
}

function FormEditarParada({ setEditarParada, parada }: FormEditarParadaProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ICriarParadaBody>({
    resolver: zodResolver(criarParadaSchema),
    defaultValues: {
      motivo: parada.motivo,
      dataInicio: parada.dataInicio,
      horaInicio: parada.horaInicio,
      dataFim: parada.dataFim,
      horaFim: parada.horaFim,
      maquina: parada.maquina,
    },
  });

  const onSubmit = async (data: ICriarParadaBody) => {
    try {
      await apiClient.post<IParadas>("/paradas", {
        motivo: data.motivo,
        data_inicio: data.dataInicio,
        hora_inicio: data.horaInicio,
        data_fim: data.dataFim,
        hora_fim: data.horaFim,
        maquina: data.maquina,
      });

      toast.success("Parada criada com sucesso!");
      setEditarParada(false);
    } catch (error) {
      console.error("Erro ao criar parada:", error);
      toast.error("Erro ao criar parada. Tente novamente.");
    }
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
            id="maquina"
            className="w-full outline-none border-b border-[#A4AABC] bg-white"
            {...register("maquina")}
          >
            <option value="">Selecione a máquina</option>
            <option value="Maq 1">Maq 1</option>
            <option value="Maq 2">Maq 2</option>
            {/* Adicione mais opções conforme necessário */}
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
