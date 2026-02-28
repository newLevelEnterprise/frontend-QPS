import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { apiClient } from "../../../utils/apiClient";
import Button from "../Button";
import FormErrorMessage from "../forms/FormErrorMessage";

interface IFormNovoTurnoProps {
  setNovoTurno: Dispatch<SetStateAction<boolean>>;
  setTurno: () => void;
}

const schema = z.object({
  dia_semana: z.enum([
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo",
  ]),
  manha: z.boolean(),
  tarde: z.boolean(),
  noite: z.boolean(),
  frequencia: z.enum([
    "Diário",
    "Semanal",
    "Mensal",
    "Quinzenal",
    "Não Trabalha",
  ]),
});

type IFormNovoTurnoValues = z.infer<typeof schema>;

function FormNovoTurno({ setNovoTurno, setTurno }: IFormNovoTurnoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<IFormNovoTurnoValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: IFormNovoTurnoValues) => {
    try {
      await apiClient.post("/regular-shifts", {
        dia_semana: data.dia_semana,
        manha: data.manha,
        tarde: data.tarde,
        noite: data.noite,
        frequencia: data.frequencia,
      });
      toast.success("Turno criado com sucesso!");
      setTurno();
      setNovoTurno(false);
    } catch (error) {
      console.error("Erro ao criar Turno:", error);
      toast.error("Erro ao criar Turno. Tente novamente.");
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
            htmlFor="dia_semana"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            Dia da Semana
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <select
              id="dia_semana"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("dia_semana")}
              defaultValue=""
            >
              <option value="" disabled>
                Selecione o dia da semana
              </option>
              <option value="Segunda-feira">Segunda-feira</option>
              <option value="Terça-feira">Terça-feira</option>
              <option value="Quarta-feira">Quarta-feira</option>
              <option value="Quinta-feira">Quinta-feira</option>
              <option value="Sexta-feira">Sexta-feira</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
          </div>
          {errors.dia_semana && (
            <ErrorMessage
              errors={errors}
              name="dia_semana"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="manha"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            Manha
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="manha"
              type="checkbox"
              className="h-4 w-4 accent-[#212A4F]"
              {...register("manha")}
            />
          </div>
          {errors.manha && (
            <ErrorMessage
              errors={errors}
              name="manha"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="tarde"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            Tarde
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="tarde"
              type="checkbox"
              className="h-4 w-4 accent-[#212A4F]"
              {...register("tarde")}
            />
          </div>
          {errors.tarde && (
            <ErrorMessage
              errors={errors}
              name="tarde"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="noite"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            Noite
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <input
              id="noite"
              type="checkbox"
              className="h-4 w-4 accent-[#212A4F]"
              {...register("noite")}
            />
          </div>
          {errors.noite && (
            <ErrorMessage
              errors={errors}
              name="noite"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="frequencia"
            className="text-[#212A4F] font-semibold truncate text-ellipsis text-sm"
          >
            Frequência
          </label>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-4">
            <select
              id="frequencia"
              className="w-full outline-none border-b border-[#A4AABC]"
              {...register("frequencia")}
              defaultValue=""
            >
              <option value="" disabled>
                Selecione a frequência
              </option>
              <option value="Diário">Diário</option>
              <option value="Semanal">Semanal</option>
              <option value="Mensal">Mensal</option>
              <option value="Quinzenal">Quinzenal</option>
              <option value="Não Trabalha">Não Trabalha</option>
            </select>
          </div>
          {errors.frequencia && (
            <ErrorMessage
              errors={errors}
              name="frequencia"
              render={({ message }) => <FormErrorMessage message={message} />}
            />
          )}
        </div>
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

export default FormNovoTurno;
