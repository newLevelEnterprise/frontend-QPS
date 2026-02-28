import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type { ITurnosRegulares } from "../../../types/TurnosRegulares";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";

type TurnosRegularesFormValues = {
  turnos: ITurnosRegulares[];
};

function TurnosRegulares() {
  const queryClient = useQueryClient();

  const { register, reset, watch, handleSubmit, formState } =
    useForm<TurnosRegularesFormValues>({
      defaultValues: {
        turnos: [],
      },
    });

  const { data: turnosData, isFetching } = useQuery({
    queryKey: ["get", "turnos", "regulares"],
    queryFn: async () => {
      const { data } =
        await apiClient.get<ITurnosRegulares[]>("/regular-shifts");
      return data;
    },
  });

  useEffect(() => {
    if (turnosData) {
      reset({ turnos: turnosData });
    }
  }, [reset, turnosData]);

  const turnos = watch("turnos");

  const onSubmit = async (formData: TurnosRegularesFormValues) => {
    try {
      await Promise.all(
        formData.turnos.map((turno) =>
          apiClient.put(`/regular-shifts/${turno.id}`, {
            dia_semana: turno.dia_semana,
            manha: turno.manha,
            tarde: turno.tarde,
            noite: turno.noite,
            frequencia: turno.frequencia,
          }),
        ),
      );

      toast.success("Turnos regulares atualizados com sucesso!");
      await queryClient.invalidateQueries({
        queryKey: ["get", "turnos", "regulares"],
      });
    } catch (error) {
      console.error("Erro ao atualizar turnos regulares:", error);
      toast.error("Erro ao atualizar turnos regulares. Tente novamente.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col justify-between bg-white rounded-md shadow p-4"
    >
      <div className="shadow-sm p-6 rounded-lg bg-white border border-gray-200">
        <h1 className="text-xl text-[#5B85D5] font-bold">Turnos Regulares</h1>
        {isFetching && <Loader message="Carregando turnos regulares" />}
        {!isFetching && (
          <div className="rounded-lg overflow-y-auto mt-10 h-[470px] overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Turnos Regulares</th>
                  <th className="px-4 py-2 text-center">
                    Manhã
                    <br />
                    <span className="text-xs text-gray-400">(06h - 14h)</span>
                  </th>
                  <th className="px-4 py-2 text-center">
                    Tarde
                    <br />
                    <span className="text-xs text-gray-400">(14h às 22h)</span>
                  </th>
                  <th className="px-4 py-2 text-center">
                    Noite
                    <br />
                    <span className="text-xs text-gray-400">(22h às 06h)</span>
                  </th>
                  <th className="px-4 py-2 text-center">Frequência</th>
                </tr>
              </thead>
              <tbody>
                {turnos?.map((turno, index) => (
                  <tr
                    key={turno.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <td className="px-4 py-2">
                      {turno.dia_semana}
                      <input
                        type="hidden"
                        {...register(`turnos.${index}.id`, {
                          valueAsNumber: true,
                        })}
                      />
                      <input
                        type="hidden"
                        {...register(`turnos.${index}.dia_semana`)}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        {...register(`turnos.${index}.manha`)}
                        className="accent-blue-600 w-5 h-5"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        {...register(`turnos.${index}.tarde`)}
                        className="accent-blue-600 w-5 h-5"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        {...register(`turnos.${index}.noite`)}
                        className="accent-blue-600 w-5 h-5"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <select
                        {...register(`turnos.${index}.frequencia`)}
                        className="border rounded p-1"
                      >
                        <option>Diário</option>
                        <option>Semanal</option>
                        <option>Quinzenal</option>
                        <option>Mensal</option>
                        <option>Não Trabalha</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="flex items-end justify-end mt-4">
        <button
          type="submit"
          disabled={isFetching || formState.isSubmitting || turnos.length === 0}
          className="disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer text-sm md:text-base inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {formState.isSubmitting ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          ) : (
            "Prosseguir"
          )}
        </button>
      </div>
    </form>
  );
}

export default TurnosRegulares;
