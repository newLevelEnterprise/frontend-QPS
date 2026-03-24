import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { ITurnosRegulares } from "../../../types/TurnosRegulares";
import { apiClient } from "../../../utils/apiClient";
import Loader from "../Loader";
import Modal from "../modal";
import FormEditarTurno from "./formEditarTurno";
import FormNovoTurno from "./formNovoTurno";

function TurnosRegulares() {
  const ordemDiasSemana: ITurnosRegulares["dia_semana"][] = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo",
  ];

  const queryClient = useQueryClient();
  const [novoTurno, setNovoTurno] = useState<boolean>(false);
  const [editarTurno, setEditarTurno] = useState<boolean>(false);

  const [turno, setTurno] = useState<ITurnosRegulares>({
    id: 0,
    dia_semana: "Segunda-feira",
    manha: false,
    tarde: false,
    noite: false,
    frequencia: "Semanal",
  });

  // const { mutateAsync, isPending } = useMutation({
  //   mutationFn: async (id: number) => {
  //     await apiClient.delete(`/regular-shifts/${id}`);
  //   },
  //   onError: (error) => {
  //     toast.error("Erro ao deletar turno. Tente novamente.");
  //     console.error("Erro ao deletar turno:", error);
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ["get", "all", "turnos-regulares"],
  //     });
  //     toast.success("Turno deletado com sucesso!");
  //   },
  // });

  const { data: turnos, isFetching } = useQuery({
    queryKey: ["get", "all", "turnos-regulares"],
    queryFn: async () => {
      const { data } =
        await apiClient.get<ITurnosRegulares[]>("/regular-shifts");
      return data;
    },
  });

  const formatPeriodo = (value: boolean) => (value ? "Sim" : "Não");

  const turnosOrdenados = [...(turnos ?? [])].sort((turnoA, turnoB) => {
    const indexA = ordemDiasSemana.indexOf(turnoA.dia_semana);
    const indexB = ordemDiasSemana.indexOf(turnoB.dia_semana);

    return indexA - indexB;
  });

  return (
    <div className="w-full bg-white rounded-md shadow p-4">
      <Modal.Root isVisible={novoTurno}>
        <Modal.Container>
          <Modal.Header
            title="Adicionar Novo Turno"
            onClose={() => setNovoTurno(false)}
          />
          <FormNovoTurno
            setTurno={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "turnos-regulares"],
              })
            }
            setNovoTurno={setNovoTurno}
          />
        </Modal.Container>
      </Modal.Root>
      <Modal.Root isVisible={editarTurno}>
        <Modal.Container>
          <Modal.Header
            title="Editar Turno"
            onClose={() => setEditarTurno(false)}
          />
          <FormEditarTurno
            setTurno={() =>
              queryClient.invalidateQueries({
                queryKey: ["get", "all", "turnos-regulares"],
              })
            }
            setNovoTurno={setEditarTurno}
            turno={turno}
          />
        </Modal.Container>
      </Modal.Root>
      <h1 className="text-xl text-[#5B85D5] font-bold">Turnos Regulares</h1>
      {isFetching && <Loader message="Carregando turnos regulares" />}
      {!isFetching && (
        <div className="border border-gray-200 rounded-lg overflow-y-auto shadow-sm mt-2 h-fit max-h-[470px] overflow-x-auto">
          <table className="w-full overflow-auto max-h-[470px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Dia da Semana
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Manhã
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Tarde
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Noite
                </th>
                <th className="px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                  Frequência
                </th>
                <th className="px-6 py-4 text-right text-xs md:text-sm font-medium text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {turnosOrdenados.map((itemTurno) => (
                <tr
                  key={itemTurno.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {itemTurno.dia_semana}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {formatPeriodo(itemTurno.manha)}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {formatPeriodo(itemTurno.tarde)}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {formatPeriodo(itemTurno.noite)}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-900">
                    {itemTurno.frequencia}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="w-full flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setTurno(itemTurno);
                          setEditarTurno(true);
                        }}
                        className="text-blue-600 cursor-pointer hover:text-blue-800 text-xs md:text-sm font-medium transition-colors duration-150"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TurnosRegulares;
